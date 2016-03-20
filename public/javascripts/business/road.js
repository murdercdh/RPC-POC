
var roadChart = function (options) {
    this.defVal = {
        container: "container-road",
        width: 1300,
        height: 680,
        roadColors: ["#FEDDCE", "#FEF8F6"],//["#E8E8E8", "#CECECE"],
        roadHoverColor: "#EF3C40",//'#CC1A00',
        roadColorsHover: ["#DBDBDB", "#FEF8F6"],
        boxColorsHover: ["#B4B3B3", "#918B8B"],//["#666666", "#525252"],
        boxColors: ["#CC1A00", "#A00405"],
        boxHoverColor: '#A00405',
        fontFamily: 'Microsoft YaHei UI',
        data: null,
        title: ""
    };

    this.opts = $.extend({}, this.defVal, options);
}

roadChart.prototype = {
    /* initialize all public parameters here */
    preInit: function () {
        if (this.opts.width < 1300) this.opts.width = 1300;
        if (this.opts.height < 680) this.opts.height = 680;
        this.maxCount = 20;
        this.milestoneLineCount = 5;
        this.topWidth = 220;
        this.bottomWidth = this.opts.width - 300;
        this.topStartPoints = { x: (this.bottomWidth - this.topWidth) / 2 + 150, y: 0 };
        this.bottomStartPoints = { x: 150, y: this.opts.height - 120 };
        this.bezierFactor = 0.62;
        this.animateFlage = 0; // the animation indicator: 1 - from top to bottom, 0 - stop, -1 - from bottom to top.
        this.speed = 115; // a number not zero to illustrate the animation speed. The larger number, the slower speed.
        this.isRunning = false; // to illustrate if the animation is running.
        //this.clicked = false; // to illustrate if there is strory image is clicked

        this.roadWidthTop = 0;
        this.roadWidthBottom = 0;
        this.roadTopPoints = [];
        this.roadBottomPoints = [];

        /* basic controls collection, needs to move these controls when animation is running */
        this.milestoneLines = []; // milestone lines data collection.
        this.storyImages = []; // story images data collection.
        this.dateTexts = []; // date text data collection.    

        this.addresses = []; // all roads array
        this.roadDate = []; // all road dates array
        this.categoryData = [];
        this.fontSize = { max: 20, min: 14 };
        this.imageSize = { max: 75, min: 30 };
        this.imagePathRoot = "./images/road/";
        this.imageGallery = [
            { cate: "合作", src: this.imagePathRoot + "normal1.png", color: "#0CACFA" },
            { cate: "论坛", src: this.imagePathRoot + "normal3.png", color: "#FEC356" },
            { cate: "宣传", src: this.imagePathRoot + "normal4.png", color: "#8078FC" },
            { cate: "客户", src: this.imagePathRoot + "normal5.png", color: "#FF5868" },
            { cate: "展会", src: this.imagePathRoot + "normal2.png", color: "#43DF9B" },
            { cate: "获奖", src: this.imagePathRoot + "normal9.png", color: "#FF1E1E" },
            { cate: "签约", src: this.imagePathRoot + "normal6.png", color: "#FF9ACC" },
            { cate: "任命", src: this.imagePathRoot + "normal10.png", color: "#73AEFF" },
            { cate: "出访", src: this.imagePathRoot + "normal7.png", color: "#00BEB5" },
            { cate: "来访", src: this.imagePathRoot + "normal8.png", color: "#FF8F26" },
            { cate: "招聘", src: this.imagePathRoot + "normal11.png", color: "#7FCB64" }
        ];
        this.infoPanelHandler = null;
        this.currAddress = null;
        // information panel HTML fragment
        this.infoPanelHtml = '<div id="gInfoPanel" style="width: 360px;position:absolute;top:65px;left:{0}px;z-index:2;overflow:hidden;display:none;"></div>';
    },

    /* initialize process */
    init: function () {
        var that = this;
        var addressArr = [], dateArr = [], cateArr = [];

        that.preInit();

        if (that.opts.data == null) return;

        // initialize HTML hierarchy
        var main = $("#" + that.opts.container);
        main.css(
            {
                "position": "relative",
                "font-family": that.opts.fontFamily,
                "height": that.opts.height
            }
        );
        var _left = Math.ceil((main.width() - that.opts.width) / 2);
        if (_left < 0) _left = 0;
        var $svgContainerHTML = '<div id="' + that.opts.container.concat("-main") + '" style="position: absolute;top:0px;left:' + _left + 'px;"></div>';
        main.append($svgContainerHTML);

        that.infoPanelHtml = that.infoPanelHtml.format(40);

        for (var i = 0, ci; ci = that.opts.data[i]; i++) {
            addressArr.push(ci.location);
            dateArr.push(new Date(ci.date));
            cateArr.push(ci.category);
        }

        // get all unique addresses
        that.addresses = addressArr.Unique();
        that.addresses.splice(that.maxCount);
        // get all unique categories
        //that.categoryData = cateArr.Unique();
        that.categoryData = cateArr.Unique().map(function (cate) {
            return {
                name: cate,
                checked: true
            };
        });

        if (that.addresses.length > 0) {
            that.roadWidthTop = that.topWidth / that.addresses.length;
            that.roadWidthBottom = that.bottomWidth / that.addresses.length;
        }

        var maxDate = d3.max(dateArr);
        var minDate = d3.min(dateArr);
        var dayDiff = parseInt(getDateDiff(minDate, maxDate));
        var dateCount = Math.ceil(dayDiff / 7) + 1;

        for (var i = 0; i < dateCount; i++) {
            var newDate = addDates(minDate.toString(), i * 7);
            that.roadDate.push(newDate.Format("yyyy-MM-dd"));
        }
    },

    /* get image url by data category */
    getImageGalleryByCategory: function (data) {
        var that = this;
        if (data.category != undefined) {
            for (var i = 0, ci; ci = that.imageGallery[i]; i++) {
                if (ci.cate == data.category) return ci;
            }
        }
        // if no found, returns the first one as default
        return that.imageGallery[0];
    },

    /*create the address box*/
    createBox: function (id, s, n, gBox) {
        var that = this;
        var _fontSize = that.maxCount - that.addresses.length + that.fontSize.min;
        if (_fontSize < that.fontSize.min) _fontSize = that.fontSize.min;
        if (_fontSize > that.fontSize.max) _fontSize = that.fontSize.max;
        // the box start x position
        var _x = Math.ceil(that.roadBottomPoints[n].x);
        // the box width
        var _width = Math.ceil(that.roadWidthBottom);
        var color = that.opts.boxColors[n % 2];

        var group = gBox.append("g").attr("id", id);

        var rect = group.append("rect")
            .attr("x", _x)
            .attr("y", that.roadBottomPoints[n].y + 2)
            .attr("width", _width)
            .attr("height", 120)
            .attr("cursor", "pointer")
            .attr("fill", color)
            .attr("oriColor", color);

        var text = group.append("text")
            //.attr("x", _x + _width / 2)
            //.attr("y", that.roadBottomPoints[n].y + 15)
            //.attr("writing-mode", "tb")
            .attr("font-size", _fontSize)
            .attr("font-family", that.opts.fontFamily)
            .attr("fill", "white")
            .attr("rotate", -90)
            .attr("letter-spacing", "0.2em")
            .attr("transform", "translate(" + (_x + _width / 2 - _fontSize / 2) + ", " + (that.roadBottomPoints[n].y + 2 + _fontSize * 2) + ") rotate(90)")
            .text(s);

        //text.style("text-anchor", "middle");
        return group;
    },

    /*create road*/
    createRoad: function (id, n, gPath) {
        var that = this;
        var color = that.opts.roadColors[n % 2];
        var d = "M" + that.roadTopPoints[n].x + "," + that.roadTopPoints[n].y;
        d = d + "Q" + that.roadTopPoints[n].x + " " + (that.roadBottomPoints[n].y * that.bezierFactor) + " " + that.roadBottomPoints[n].x + " " + that.roadBottomPoints[n].y;
        d = d + "L" + that.roadBottomPoints[n + 1].x + "," + that.roadBottomPoints[n + 1].y;
        d = d + "Q" + that.roadTopPoints[n + 1].x + " " + (that.roadBottomPoints[n + 1].y * that.bezierFactor) + " " + that.roadTopPoints[n + 1].x + " " + that.roadTopPoints[n + 1].y;
        d = d + "Z";
        var path = gPath.append("path")
            .attr("d", d)
            .attr("fill", color)
            .attr("id", id)
            .attr("oriColor", color);
        return path;
    },

    /* create the top cover */
    createTopCover: function (svg) {
        var that = this;
        var coverHeight = 220;
        var coverWidth = that.bottomWidth * 0.5;
        var coverStartPoints = { x: that.topStartPoints.x - coverWidth * 0.15, y: that.topStartPoints.y };
        var gradient = svg.append("defs").append("linearGradient").attr("id", "gradientTopCover").attr("x1", "0%").attr("y1", "0%")
                            .attr("x2", "0%").attr("y2", "100%").attr("spreadMethod", "pad");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255,255,255,1)");//.attr("stop-opacity", 1)
        gradient.append("stop").attr("offset", "65%").attr("stop-color", "rgba(255,255,255,0.65)");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255,255,255,0)");

        var rect = svg.append("rect")
            .attr("x", coverStartPoints.x)
            .attr("y", coverStartPoints.y)
            .attr("width", coverWidth)
            .attr("height", coverHeight)
            .attr("fill", "url(#gradientTopCover)")
            .attr("style", "pointer-events: none;");
        return rect;
    },

    /* Create the start arrow sign graphic */
    createStartArrowSign: function (svg) {
        var that = this;
        var arrowSignStartPoints = { x: that.bottomStartPoints.x + that.bottomWidth / 2, y: that.bottomStartPoints.y };
        var gradient = svg.append("defs").append("linearGradient").attr("id", "gradientArrowSign").attr("x1", "0%").attr("y1", "0%")
                            .attr("x2", "0%").attr("y2", "100%").attr("spreadMethod", "pad");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(176,111,74,1)");
        gradient.append("stop").attr("offset", "60%").attr("stop-color", "rgba(176,111,74,0.85)");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(176,111,74,0)");
        var path = svg.append("path")
                    .attr("id", "arrowSignStart")
                    .attr("d", "M40,0 L30,-30 L80,-30 L0,-60 L-80,-30 L-30,-30 L-40,0Z")
                    .attr("fill", "url(#gradientArrowSign)")
                    .attr("fill-opacity", "0.2")
                    .attr("transform", "translate(" + arrowSignStartPoints.x + "," + arrowSignStartPoints.y + ") scale(3)");
        return path;
    },

    /* Create the end arrow sign graphic */
    createEndArrowSign: function (svg) {
        var that = this;
        if (that.milestoneLines.length == 0) return null;

        var _y = that.milestoneLines[that.milestoneLines.length - 1].get("y1") - ((that.bottomStartPoints.y - that.topStartPoints.y) / 2.2);
        var arrowSignStartPoints = { x: that.bottomStartPoints.x + that.bottomWidth / 2, y: _y };
        var gradient = svg.append("defs").append("linearGradient").attr("id", "gradientArrowSign").attr("x1", "0%").attr("y1", "0%")
                            .attr("x2", "0%").attr("y2", "100%").attr("spreadMethod", "pad");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(176,111,74,1)");
        gradient.append("stop").attr("offset", "60%").attr("stop-color", "rgba(176,111,74,0.75)");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255,255,255,0)");
        var path = svg.append("path")
                    .attr("id", "arrowSignEnd")
                    .attr("d", "M35,0 L30,-30 L75,-30 L0,-60 L-75,-30 L-30,-30 L-35,0Z")
                    .attr("fill", "url(#gradientArrowSign)")
                    .attr("fill-opacity", "0.2")
                    .attr("transform", "translate(" + arrowSignStartPoints.x + "," + arrowSignStartPoints.y + ") scale(1.6)");
        return path;
    },

    /* Revert the clicked image */
    revertClickedImage: function (cateName) {
        var that = this;

        d3.select("#gImage").selectAll("image").each(function (d, i) {
            var tar = d3.select(this);
            if (tar.attr("clicked") == "true") {
                if (cateName && tar.attr("cate") == cateName) {
                    tar.on("click").apply(this, arguments);
                    tar.on("mouseout").apply(this, arguments);
                    return;
                }
                else if (!cateName) {
                    tar.on("click").apply(this, arguments);
                    tar.on("mouseout").apply(this, arguments);
                    return;
                }
            }
        });
    },

    /* create controller */
    createController: function (gPath) {
        var that = this;
        var _speed = that.speed;

        // to run the animation. flag: 1 - move down; -1 - move up.
        function run(flag) {
            that.animateFlage = flag;
            that.speed = _speed;
            that.revertClickedImage();
            if (!that.isRunning) {
                that.isRunning = true;
                that.createAnimation();
            }
        }

        // stop animation
        function stop() {
            that.animateFlage = 0;
            that.speed = _speed;
            that.isRunning = false;
        }

        // background
        var gradient = gPath.append("defs").append("linearGradient").attr("id", "gradientController").attr("x1", "0%").attr("y1", "0%")
                            .attr("x2", "0%").attr("y2", "100%").attr("spreadMethod", "pad");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(233,185,146,1)");
        gradient.append("stop").attr("offset", "50%").attr("stop-color", "rgba(248,232,219,1)");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255,255,255,1)");
        var bg = gPath.append("rect")
            .attr("x", -5)
            .attr("y", -5)
            .attr("rx", 22)
            .attr("ry", 22)
            .attr("width", 45)
            .attr("height", 111)
            .attr("stroke", "#F4DCB5")
            .attr("fill", "url(#gradientController)")

        var grads = gPath.append("defs").append("radialGradient").attr("id", "gradientControllerBtn").attr("x1", "0%").attr("y1", "0%")
                            .attr("x2", "0%").attr("y2", "100%").attr("spreadMethod", "pad");
        grads.append("stop").attr("offset", "0%").attr("stop-color", "rgba(253,235,203,1)");
        grads.append("stop").attr("offset", "100%").attr("stop-color", "rgba(238,213,175,1)");
        // up button
        var upBtn = gPath.append("g")
            .attr("cursor", "pointer")
            .on("mousedown", function () {
                run(1);
                //d3.select(this).select("path").attr("fill", "#03a9f4");
                d3.select(this).selectAll("path").each(function (d, i) {
                    if (i == 1) d3.select(this).attr("stroke", "#FFFFFF");
                });
            })
            .on("mouseup", function () {
                stop();
            })
            .on("mouseover", function () {
                //d3.select(this).select("path").attr("fill", "#03a9f4");
                d3.select(this).selectAll("path").each(function (d, i) {
                    if (i == 1) d3.select(this).attr("stroke", "#FFFFFF");
                });
            })
            .on("mouseout", function () {
                stop();
                //d3.select(this).select("path").attr("fill", "#7B7B7B");
                d3.select(this).selectAll("path").each(function (d, i) {
                    if (i == 1) d3.select(this).attr("stroke", "#B57A5A");
                });
            });
        upBtn.append("path")
            .attr("d", that.rightRoundedRect(0, 50, 50, 35, 17))
            //.attr("fill", "#EFD6B0")
            .attr("fill", "url(#gradientControllerBtn)")
            .attr("stroke", "#FFF7EB")
            .attr("transform", "rotate(-90, 0, 50)")
            //.append("title")
            //.text("向下滚");
        upBtn.append("path")
            .attr("d", "M0,0 L11,-12 L22,0")
            .attr("transform", "translate(7,30)")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("stroke", "#B57A5A");
        upBtn.append("line")
            .attr("x1", 0)
            .attr("y1", 50.5)
            .attr("x2", 35)
            .attr("y2", 50.5)
            .attr("stroke", "#FFFFFF");
        //upBtn.append("line")
        //    .attr("x1", 0)
        //    .attr("y1", 51.5)
        //    .attr("x2", 35)
        //    .attr("y2", 51.5)
        //    .attr("stroke", "#FFFFFF");

        // down button
        var downBtn = gPath.append("g")
            .attr("cursor", "pointer")
            .on("mousedown", function () {
                run(-1);
                //d3.select(this).select("path").attr("fill", "#03a9f4");
                d3.select(this).selectAll("path").each(function (d, i) {
                    if (i == 1) d3.select(this).attr("stroke", "#FFFFFF");
                });
            })
            .on("mouseup", function () {
                stop();
            })
            .on("mouseover", function () {
                //d3.select(this).select("path").attr("fill", "#03a9f4");
                d3.select(this).selectAll("path").each(function (d, i) {
                    if (i == 1) d3.select(this).attr("stroke", "#FFFFFF");
                });
            })
            .on("mouseout", function () {
                stop();
                //d3.select(this).select("path").attr("fill", "#7B7B7B");
                d3.select(this).selectAll("path").each(function (d, i) {
                    if (i == 1) d3.select(this).attr("stroke", "#B57A5A");
                });
            });
        downBtn.append("path")
            .attr("d", that.rightRoundedRect(35, 51, 50, 35, 17))
            //.attr("fill", "#EFD6B0")
            .attr("fill", "url(#gradientControllerBtn)")
            .attr("stroke", "#FFF7EB")
            .attr("transform", "rotate(90, 35, 51)")
            //.append("title")
            //.text("向上滚");
        downBtn.append("path")
            .attr("d", "M0,0 L11,-12 L22,0")
            .attr("transform", "translate(9,79) rotate(180, 10, -4)")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("stroke", "#B57A5A");

        gPath.attr("transform", "translate(" + (this.opts.width - 260) + ", 160)");
    },

    /* create legend */
    createLegend: function (gLegend) {
        var that = this;
        gLegend.attr("transform", "translate(" + (that.opts.width - 175) + ", 60)")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", "5")
            .attr("ry", "5")
            .attr("width", 140)
            .attr("height", 90 + 40 * (that.categoryData.length - 1))
            .attr("stroke", "#D8C7C3")
            .attr("stroke-width", 2)
            .attr("fill", "white");

        var legends = [];

        for (var i = 0, ci; ci = that.categoryData[i]; i++) {
            var _src = that.getImageGalleryByCategory({ category: ci.name }).src.replace("normal", "ico");
            var t_legend = d3.map();
            t_legend.set("imageX", 50);
            t_legend.set("imageY", 18 + 45 * i);
            t_legend.set("textX", 90);
            t_legend.set("textY", 38 + 45 * i);
            t_legend.set("checkboxX", 20);
            t_legend.set("checkboxY", 25 + 45 * i);
            var d = "M" + (this.x + 3) + "," + (this.y + this.height / 2)
                      + " L" + (this.x + this.width / 2) + "," + (this.y + this.height - 3)
                      + " L" + (this.x + this.width - 3) + "," + (this.y + this.height / 4);
            t_legend.set("src", _src);
            t_legend.set("text", ci.name);

            legends.push(t_legend);
        }

        var images = gLegend.selectAll("image")
            .data(legends)
            .enter()
            .append("image")
            .attr("x", function (d) { return d.get('imageX'); })
            .attr("y", function (d) { return d.get('imageY'); })
            .attr("width", 30)
            .attr("height", 30)
            .attr("xlink:href", function (d) { return d.get('src'); });

        var texts = gLegend.selectAll("text")
            .data(legends)
            .enter()
            .append("text")
            .attr("x", function (d) { return d.get('textX'); })
            .attr("y", function (d) { return d.get('textY'); })
            .attr("font-size", 14)
            .text(function (d) { return d.get('text'); });

        var checkboxWidth = 18, checkboxHeight = 18;
        var checkboxes = gLegend.selectAll("g")
            .data(legends)
            .enter()
            .append("g")
            .attr("cursor", "pointer")
            .attr("cate", function (d) { return d.get('text'); })
            .on("click", function () {
                var cate = d3.select(this).attr("cate");
                var tarObj = d3.select(this).select("path");
                var display = tarObj.attr("display") == "block" ? "none" : "block";

                that.revertClickedImage(cate);

                // update categoryData
                for (var j = 0, c; c = that.categoryData[j]; j++) {
                    if (cate == c.name) c.checked = display == "block";
                }
                
                // update information panel
                if (that.infoPanelHandler != null)
                    that.infoPanelHandler.apply(that, arguments);
                
                // change story images status
                for (var i = 0, ci; ci = that.storyImages[i]; i++) {
                    if (cate == ci.get("cate")) {
                        ci.set("ishidden", display == "block" ? "false" : "true");
                        var _y = ci.get('y'), _height = ci.get('height');
                        if ((_y + _height) > that.bottomStartPoints.y || (_y - _height) < that.topStartPoints.y) ci.set("display", "none");
                        else ci.set("display", display);
                    }
                }
                
                d3.select("#gImage").selectAll("image")
                    .attr("ishidden", function (d) { return d.get('ishidden'); })
                    .attr("display", function (d) { return d.get('display'); })
                
                // change checkbox status
                tarObj.attr("display", display);
            });
        checkboxes.append("rect")
            .attr("x", function (d) { return d.get('checkboxX'); })
            .attr("y", function (d) { return d.get('checkboxY'); })
            .attr("rx", "3")
            .attr("ry", "3")
            .attr("width", checkboxWidth)
            .attr("height", checkboxHeight)
            .attr("stroke", "#B87D5B")
            .attr("fill", "white");
        checkboxes.append("path")
                .attr("d", function (d) {
                    var _x = d.get('checkboxX');
                    var _y = d.get('checkboxY');
                    return "M" + (_x + 3) + "," + (_y + checkboxHeight / 2)
                               + " L" + (_x + checkboxWidth / 2) + "," + (_y + checkboxHeight - 3)
                               + " L" + (_x + checkboxWidth - 3) + "," + (_y + checkboxHeight / 4)
                })
                .attr("display", "block")
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke", "#A20A0B");
    },

    /* create the information panel on the top left corner */
    createInfoPanel: function (data) {
        var that = this;
        that.infoPanelHandler = null;
        // if the information panel does exist, remove it.
        $("#gInfoPanel").remove();
        $("#" + that.opts.container).append(that.infoPanelHtml);

        // append heading
        //var txtHead = (data.heading.length > 19) ? data.heading.substring(0, 16).concat("...") : data.heading;
        var infoPanel = d3.select("#gInfoPanel");
        var infoPanelHeader = infoPanel.append("div").attr("style", "overflow:hidden;");
        infoPanelHeader.append("img")
            .attr("height", 25)
            .attr("width", 25)
            .attr("src", that.getImageGalleryByCategory(data).src.replace("normal", "ico"))
            .attr("style", "float:left;margin-right:10px;");

        if (data.link_url.length > 0) {
            // has link_url
            infoPanelHeader.append("a")
                .attr("href", data.link_url)
                .attr("title", data.heading)
                .attr("target", "_blank")
                .attr("style", "font-size:16px;font-weight:bold;color:black;text-decoration:none;width:325px;float:right;")
                .on("mouseover", function () { d3.select(this).style("text-decoration", "underline"); })
                .on("mouseout", function () { d3.select(this).style("text-decoration", "none"); })
                .text(data.heading);
        }
        else {
            // doesn't have link_url
            infoPanelHeader.append("span")
                .attr("title", data.heading)
                .attr("style", "font-size:16px;font-weight:bold;color:black;width:325px;float:right;")
                .text(data.heading);
        }

        // append content body
        infoPanel.append("div")
            .attr("style", "max-height:220px;overflow:hidden;font-size:12px;line-height:24px;margin-top: 10px;padding-right:8px;")
            .append("span")
            //.attr("title", data.content)
            .html(data.content);
        if (data.content.length > 0) {
            // add nicescroll for content body container
            $("#gInfoPanel div:eq(1)").niceScroll({
                cursorcolor: "#D1D1D1",
                cursorborder: "",
                autohidemode: false
            });
        }

        // append labels
        var infoPanelLabels = infoPanel.append("div").attr("style", "margin-top:12px;color:white;");
        var color = that.getImageGalleryByCategory(data).color;
        // date
        infoPanelLabels.append("span")
            .attr("style", "background-color:" + color + ";border-radius:10px;font-size:12px;float:left;padding:2px 6px 2px 6px;margin:0px 10px 8px 0px;")
            .text(new Date(data.date).Format("yyyy-MM-dd"));
        // location
        infoPanelLabels.append("span")
            .attr("style", "background-color:" + color + ";border-radius:10px;font-size:12px;float:left;padding:2px 6px 2px 6px;margin:0px 10px 8px 0px;")
            .text(data.location);
        // category
        infoPanelLabels.append("span")
            .attr("style", "background-color:" + color + ";border-radius:10px;font-size:12px;float:left;padding:2px 6px 2px 6px;margin:0px 10px 8px 0px;")
            .text(data.category);
        // character
        infoPanelLabels.append("span")
            .attr("style", "background-color:" + color + ";border-radius:10px;font-size:12px;float:left;padding:2px 6px 2px 6px;margin:0px 10px 8px 0px;")
            .text(data.character);
        // subject
        //infoPanelLabels.append("span")
        //    .attr("style", "background-color:#7BCA8B;border-radius:10px;font-size:12px;float:left;padding:2px 6px 2px 6px;margin:0px 10px 8px 0px;")
        //    .text(data.subject);
        $("#gInfoPanel").fadeIn();
    },

    /* create the address information panel */
    createAddressInfoPanel: function () {
        var that = this;
        that.infoPanelHandler = that.createAddressInfoPanel;
        // if the information panel does exist, remove it.
        $("#gInfoPanel").remove();
        $("#" + that.opts.container).append(that.infoPanelHtml);

        if (that.currAddress == null) return;
        var infoPanel = d3.select("#gInfoPanel")
            .append("div")
            .attr("style", "max-height:210px;min-height:120px;overflow:hidden;font-size:12px;line-height:24px;margin-top: 20px;padding:10px;border:solid 2px #D8C7C3;border-radius:5px;background-color:white;")
        var addData = [];
        for (var i = 0, c; c = that.opts.data[i]; i++) {
            if (c.location == that.currAddress) {
                for (var j = 0, cate; cate = that.categoryData[j]; j++) {
                    if (cate.checked && c.category == cate.name) {
                        addData.push({
                            index: i,
                            data: c,
                            color: that.getImageGalleryByCategory(c).color
                        });
                        break;
                    }
                }
            }
        }

        addData.sort(function (a, b) {
            var date1 = new Date(b.data.date);
            var date2 = new Date(a.data.date);
            return (date2 - date1);
        });

        for (var j = 0, ci; ci = addData[j]; j++) {
            var divItem = infoPanel.append("div")
                    .attr("index", ci.index)
                    .attr("style", "height: 24px; overflow:hidden; margin-bottom: 8px; cursor: pointer;")
                    .on("click", function () {
                        that.revertClickedImage();
                        var index = d3.select(this).attr("index");
                        var tar = d3.select("#gImage").select("#imgObj_".concat(index));
                        tar.on("mouseover").apply(tar.node(), arguments);
                        setTimeout(function () {
                            tar.on("click").apply(tar.node(), arguments);
                        }, 150);
                    });
            // color
            divItem.append("div").attr("title", ci.data.category).attr("style", "float: left; width: 6px; height: 10px; margin: 8px 12px 0px 0px; background-color:" + ci.color);
            // date
            divItem.append("div").attr("style", "float: left; overflow:hidden; margin-right:12px;").text(new Date(ci.data.date).Format("yyyy-MM-dd"));
            // heading
            divItem.append("div").attr("style", "float: left; overflow:hidden; width: 238px; height: 24px;").attr("title", ci.data.heading).html(ci.data.heading);
        }

        if (addData.length > 0) {
            // add nicescroll for content body container
            $("#gInfoPanel div:eq(0)").niceScroll({
                cursorcolor: "#D1D1D1",
                cursorborder: "",
                autohidemode: false
            });
        }

        $('#gInfoPanel').prepend('<span style="color:#802F01;font-size:28px;margin-bottom:30px;display:block;">' + that.currAddress + '</span>');
        $("#gInfoPanel").fadeIn();
    },

    /* create the summary information panel */
    createSummaryInfoPanel: function () {
        var that = this;
        that.infoPanelHandler = that.createSummaryInfoPanel;
        // if the information panel does exist, remove it.
        $("#gInfoPanel").remove();
        $("#" + that.opts.container).append(that.infoPanelHtml);
        
        var sumData = [], cate = [];
        for (var i = 0, c; c = that.categoryData[i]; i++) {
            if (!c.checked) continue;
            var num = 0;
            for (var j = 0, d; d = that.opts.data[j]; j++) {
                if (c.name == d.category) num++;
            }
            sumData.push({
                color: that.getImageGalleryByCategory({ category: c.name }).color,
                y: num
            });
            cate.push(c.name);
        }

        $('#gInfoPanel').highcharts({
            chart: {
                type: 'column',
                height: 220,
                borderColor: '#D8C7C3',
                borderWidth: 2,
                borderRadius: 5,
                spacing: [35, 15, 25, 15],
                style: {
                    "fontFamily": that.opts.fontFamily
                }
            },
            title: { text: '' },
            xAxis: {
                categories: cate,//that.categoryData,
                tickWidth: 0,
                lineColor: '#D8B58B',
                labels: {
                    style: {
                        "fontSize": "14px"
                    }
                }
            },
            yAxis: {
                gridLineColor: "#F6E3C4",
                lineColor: '#D8B58B',
                lineWidth: 1,
                title: { text: '' }
            },
            exporting: { enabled: false },
            credits: { enabled: false },
            legend: { enabled: false },
            tooltip: {
                formatter: function () { return this.x + '：' + this.y; }
            },
            series: [{
                data: sumData
            }]
        });

        $('#gInfoPanel').prepend('<span style="color:#802F01;font-size:28px;margin-bottom:30px;display:block;">' + that.opts.title + '</span>');
        $("#gInfoPanel").fadeIn();
    },

    /* Calc an XY along a quadratic curve at interval T
       T==0.00 at start of curve, T==1.00 at end of curve */
    getQuadraticBezierXYatT: function (startPt, controlPt, endPt, T) {
        var x = Math.pow(1 - T, 2) * startPt.x + 2 * (1 - T) * T * controlPt.x + Math.pow(T, 2) * endPt.x;
        var y = Math.pow(1 - T, 2) * startPt.y + 2 * (1 - T) * T * controlPt.y + Math.pow(T, 2) * endPt.y;
        return ({
            x: x,
            y: y
        });
    },

    /* Returns path data for a rectangle with rounded right corners.
       The top-left corner is ⟨x,y⟩. */
    rightRoundedRect: function (x, y, width, height, radius) {
        return "M" + x + "," + y
             + "h" + (width - radius)
             + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
             + "v" + (height - 2 * radius)
             + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
             + "h" + (radius - width)
             + "z";
    },

    /* draw the whole thing */
    draw: function () {
        var that = this;
        $("#" + that.opts.container).empty(); // clear the container element content
        that.init(); // Initialize all parameters

        if (that.addresses.length <= 0) {
            return;
        }

        // create the root svg element
        var svg = d3.select("body")
            .select("#" + that.opts.container.concat("-main"))
            .append("svg")
            .attr("width", that.opts.width)
            .attr("height", that.opts.height)
            //.attr("shape-rendering", "optimizeSpeed")
            .attr("id", "svg_road");

        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", that.opts.width)
            .attr("height", that.opts.height)
            .attr("fill", "none");

        // create the top line and bottom line
        var dTop = "M" + that.topStartPoints.x + "," + that.topStartPoints.y + "L" + (that.topStartPoints.x + that.topWidth) + "," + that.topStartPoints.y;
        var dBottom = "M" + that.bottomStartPoints.x + "," + that.bottomStartPoints.y + "L" + (that.bottomStartPoints.x + that.bottomWidth) + "," + that.bottomStartPoints.y;
        svg.append("path").attr("d", dTop);//.attr("stroke", "gray");
        svg.append("path").attr("d", dBottom);//.attr("stroke", "gray");

        // create all road curve lines group container
        var gPath = svg.append("g").attr("id", "gPath");

        // create all milestone lines group container
        var gLine = svg.append("g").attr("id", "gLine").attr("stroke", "#f34b5b").attr("stroke-width", "1").attr("stroke-dasharray", 2).attr("style", "shape-rendering: crispEdges;");

        // create all road dates group container
        var gRoadDate = svg.append("g").attr("id", "gRoadDate").attr("fill", "white").attr("font-family", "Arial");

        // create start arrow sign on the road
        var arrowSign = that.createStartArrowSign(svg);

        // create controller svg element
        var svgController = svg.append("g").attr("id", "svgController");

        // create all address boxes group container
        var gBox = svg.append("g").attr("id", "gBox");

        // create all story images group container
        var gImage = svg.append("g").attr("id", "gImage");

        // create top cover
        var topCover = that.createTopCover(svg);

        // create legend group container
        var gLegend = svg.append("g").attr("id", "gLegend");

        // create information panel group container
        //var gInfoPanel = svg.append("g").attr("id", "gInfoPanel");

        // create the summary information panel group container
        //var gSummaryInfoPanel = svg.append("g").attr("id", "gSummaryInfoPanel");

        // draw controller
        that.createController(svgController);

        // draw roads and address boxes
        for (var i = 0; i < that.addresses.length + 1; i++) {
            that.roadTopPoints.push({
                x: that.topStartPoints.x + i * that.roadWidthTop,
                y: that.topStartPoints.y
            });
            that.roadBottomPoints.push({
                x: that.bottomStartPoints.x + i * that.roadWidthBottom,
                y: that.bottomStartPoints.y
            });

            if (i > 0) {
                var n = i - 1;
                // draw road
                var roadObj = that.createRoad('roadObj_' + n, n, gPath);
                // draw address box
                var boxObj = that.createBox('boxObj_' + n, that.addresses[n], n, gBox);
                boxObj.on("click", function () {
                    that.revertClickedImage();
                    var tarObj = d3.select(this);
                    var id = tarObj.attr("id");
                    that.currAddress = tarObj.select("text").text();
                    var index = id.replace("boxObj_", "");
                    // change road background color
                    gPath.select("#roadObj_" + index).attr("fill", that.opts.roadHoverColor);
                    gPath.selectAll("path").each(function (d, i) {
                        var self = d3.select(this);
                        if (self.attr("id") != "roadObj_".concat(index))
                            self.attr("fill", that.opts.roadColorsHover[i % 2]);
                    });
                    // change address boxes background color
                    gBox.selectAll("g").each(function () {
                        var _obj = d3.select(this);
                        if (_obj.attr("id") == id) _obj.select("rect").attr("fill", that.opts.boxHoverColor);
                        else {
                            var i = parseInt(_obj.attr("id").replace("boxObj_", ""));
                            _obj.select("rect").attr("fill", that.opts.boxColorsHover[i % 2]);
                        }
                    });
                    that.createAddressInfoPanel();
                });
            }
        }

        var lastIndex = that.roadTopPoints.length - 1;

        // draw milestone lines
        var fragment = 1 / (that.bottomStartPoints.y - that.topStartPoints.y);
        var distance = (that.bottomStartPoints.y - that.topStartPoints.y) / that.milestoneLineCount;
        for (var i = 0, ci ; ci = that.roadDate[i]; i++) {
            var t = fragment * distance * (that.milestoneLineCount - i);
            var pos1, pos2;
            if (t < 0) {
                var y = t * (that.bottomStartPoints.y - that.topStartPoints.y);
                pos1 = { x: that.topStartPoints.x, y: y };
                pos2 = { x: that.roadTopPoints[lastIndex].x, y: y };
            }
            else {
                pos1 = that.getQuadraticBezierXYatT(
                    that.roadTopPoints[0],
                    {
                        x: that.roadTopPoints[0].x,
                        y: that.roadBottomPoints[0].y * that.bezierFactor
                    },
                    that.roadBottomPoints[0],
                    t);
                pos2 = that.getQuadraticBezierXYatT(
                    that.roadTopPoints[lastIndex],
                    {
                        x: that.roadTopPoints[lastIndex].x,
                        y: that.roadBottomPoints[lastIndex].y * that.bezierFactor
                    },
                    that.roadBottomPoints[lastIndex],
                    t);
            }

            // Define milestone lines data
            var t_milestoneLine = d3.map();
            t_milestoneLine.set("id", "lineObj_" + i);
            t_milestoneLine.set("x1", pos1.x);
            t_milestoneLine.set("y1", pos1.y);
            t_milestoneLine.set("x2", pos2.x);
            t_milestoneLine.set("y2", pos1.y);
            t_milestoneLine.set("targetT", t);

            that.milestoneLines.push(t_milestoneLine);


            // Define date texts data
            var t_dateText = d3.map();
            t_dateText.set("id", "dateObj_" + i);
            t_dateText.set("x", (Math.ceil(pos2.x) + 15));
            t_dateText.set("y", Math.ceil(pos2.y));
            t_dateText.set("targetT", t.toFixed(2));
            t_dateText.set("date", ci);
            t_dateText.set("fontSize", that.fontSize.min + parseFloat((that.fontSize.max - that.fontSize.min) * t));

            that.dateTexts.push(t_dateText);
        }

        // Create the actual milestone line objects
        gLine.selectAll("line")
            .data(that.milestoneLines, function (d) { return d.get('id'); })
            .enter()
            .append("line")
            .attr("id", function (d) { return d.get('id'); })
            .attr("x1", function (d) { return d.get('x1'); })
            .attr("y1", function (d) { return d.get('y1'); })
            .attr("x2", function (d) { return d.get('x2'); })
            .attr("y2", function (d) { return d.get('y2'); })
            .attr('targetT', function (d) { return d.get('targetT'); });

        // Create the actual date text objects
        gRoadDate.selectAll("text")
                    .data(that.dateTexts, function (d) { return d.get('id'); })
                    .enter()
                    .append("text")
                    .attr("id", function (d) { return d.get('id'); })
                    .attr("x", function (d) { return d.get('x'); })
                    .attr("y", function (d) { return d.get('y'); })
                    .attr("font-size", function (d) { return d.get('fontSize'); })
                    .attr('targetT', function (d) { return d.get('targetT'); })
                    .attr('date', function (d) { return d.get('date'); })
                    .text(function (d) { return d.get('date') })
                    .each(function (d) {
                        d.width = this.getBBox().width;
                        d.height = this.getBBox().height;
                    });
        for (var j = 0, dt; dt = that.dateTexts[j]; j++) {
            gRoadDate.insert("rect", "#" + dt.get('id'))
                .attr("id", "dateRectObj_" + j)
                .attr("x", dt.get("x") - 10)
                .attr("y", dt.get("y") - dt.height + 3)
                .attr("rx", "10")
                .attr("ry", "10")
                .attr("width", dt.width + 20)
                .attr("height", dt.height)
                .attr("fill", "#B57A5A");
        }

        // create end arrow sign on the road
        var arrowSign = that.createEndArrowSign(svg);

        // Create all stories on the road
        for (var i = 0, ci; ci = that.opts.data[i]; i++) {
            var tarBox, tarDate, dayOfWeek;

            // get the target address box
            gBox.selectAll("g").each(function () {
                var _obj = d3.select(this);
                if (_obj.select("text").text() == ci.location) tarBox = _obj;
            });

            // get the target road date
            gRoadDate.selectAll("text").each(function () {
                var _obj = d3.select(this);
                var dataDiff = getDateDiff(ci.date, _obj.attr("date"));
                if (dataDiff >= 0 && dataDiff < 7) {
                    dayOfWeek = dataDiff;
                    tarDate = _obj;
                }
            });

            // draw image
            var _boxIndex = parseInt(tarBox.attr("id").replace("boxObj_", ""));
            var _dateIndex = parseInt(tarDate.attr("id").replace("dateObj_", ""));
            var tarRoad = gPath.select("#roadObj_" + _boxIndex);
            var tarLine = gLine.select("#lineObj_" + _dateIndex);
            var lineDiff = 1 / that.milestoneLineCount;
            var targetT = parseFloat(tarLine.attr("targetT")) + parseFloat(lineDiff * parseFloat(dayOfWeek / 7));
            var diffImageSize = that.imageSize.max - that.imageSize.min;
            var tarImageSize = that.imageSize.min + parseFloat(diffImageSize * targetT);
            var pos;
            if (targetT < 0) {
                pos = {
                    x: that.topStartPoints.x,
                    y: targetT * (that.bottomStartPoints.y - that.topStartPoints.y)
                };
            }
            else {
                pos = that.getQuadraticBezierXYatT(
                    {
                        x: that.roadTopPoints[_boxIndex].x + that.roadWidthTop / 2,
                        y: that.roadTopPoints[_boxIndex].y
                    },
                    {
                        x: that.roadTopPoints[_boxIndex].x + that.roadWidthTop / 2,
                        y: (that.roadBottomPoints[_boxIndex].y) * that.bezierFactor
                    },
                    {
                        x: that.roadBottomPoints[_boxIndex].x + that.roadWidthBottom / 2,
                        y: that.roadBottomPoints[_boxIndex].y
                    },
                    targetT);
            }

            // Define image data
            var t_image = d3.map();
            t_image.set("id", "imgObj_" + i);
            t_image.set("targetT", targetT);
            //t_image.set("realsize", tarImageSize);
            t_image.set("href", that.getImageGalleryByCategory(ci).src);
            t_image.set("date", new Date(ci.date));
            t_image.set("boxIndex", _boxIndex);
            t_image.set("dateIndex", _dateIndex);
            t_image.set("dayOfWeek", dayOfWeek);
            t_image.set("x", tarImageSize < 0 ? Math.ceil(pos.x) : Math.ceil(pos.x - parseFloat(tarImageSize / 2)));
            t_image.set("y", tarImageSize < 0 ? Math.ceil(pos.y) : Math.ceil(pos.y - tarImageSize));
            t_image.set("width", tarImageSize < 0 ? 0 : tarImageSize);
            t_image.set("height", tarImageSize < 0 ? 0 : tarImageSize);
            t_image.set("cate", ci.category);
            t_image.set("ishidden", "false");

            that.storyImages.push(t_image);
        }

        that.storyImages.sort(function (a, b) {
            return (b.get("date") - a.get("date"));
        });
        //that.storyImages.reverse();

        // story image jump up
        function jumpUp(objImg) {
            var _src = objImg.attr("xlink:href").replace("normal", "hover");
            var _width = parseFloat(objImg.attr("width"));
            var _x = parseFloat(objImg.attr("x"));
            var _y = parseFloat(objImg.attr("y"));

            objImg.attr("xlink:href", _src)
                .attr("width", parseFloat(_width * 1.3))
                .attr("height", parseFloat(_width * 1.3))
                .attr("x", _x - (_width * 0.3 / 2))
                .attr("y", _y - _width * 0.3);
        }

        // story image drop down
        function dropDown(objImg) {
            var _src = objImg.attr("xlink:href").replace("hover", "normal");
            var _width = parseFloat(objImg.attr("width") / 1.3);
            var _x = parseFloat(objImg.attr("x"));
            var _y = parseFloat(objImg.attr("y"));

            objImg.attr("xlink:href", _src)
                .attr("width", _width)
                .attr("height", _width)
                .attr("x", _x + (_width * 0.3 / 2))
                .attr("y", _y + (_width * 0.3));
        }

        var setTimeoutConst;
        // Create the actual image objects
        gImage.selectAll("image")
                .data(that.storyImages, function (d) { return d.get('id'); })
                .enter()
                .append("image")
                .attr("id", function (d) { return d.get('id'); })
                .attr("x", function (d) { return d.get('x'); })
                .attr("y", function (d) { return d.get('y'); })
                .attr("width", function (d) { return d.get('width'); })
                .attr("height", function (d) { return d.get('height'); })
                .attr('targetT', function (d) { return d.get('targetT'); })
                .attr('xlink:href', function (d) { return d.get('href'); })
                .attr('boxIndex', function (d) { return d.get('boxIndex'); })
                .attr('dateIndex', function (d) { return d.get('dateIndex'); })
                .attr('dayOfWeek', function (d) { return d.get('dayOfWeek'); })
                .attr("display", function (d) { return ((d.get('y') - d.get('height')) < that.topStartPoints.y) ? "none" : "block"; })
                .attr('clicked', 'false')
                .attr("ishidden", function (d) { return d.get('ishidden'); })
                .attr("cate", function (d) { return d.get('cate'); })
                .on("mouseover", function () {
                    var _this = this;
                    setTimeoutConst = setTimeout(function () {
                        setTimeoutConst = 0;
                        var _obj = d3.select(_this);
                        if (_obj.attr("clicked") == "true") return;
                        //if (that.clicked) return;
                        gImage.selectAll("image").each(function () {
                            var tar = d3.select(this);
                            if (tar.attr("clicked") == "true") {
                                tar.attr("clicked", "false");
                                dropDown(tar);
                            }
                        });

                        var boxId = _obj.attr("boxIndex");
                        var index = _obj.attr("id").replace("imgObj_", "");

                        // change road background color
                        gPath.select("#roadObj_" + boxId).attr("fill", that.opts.roadHoverColor);
                        gPath.selectAll("path").each(function (d, i) {
                            var self = d3.select(this);
                            if (self.attr("id") != "roadObj_".concat(boxId))
                                self.attr("fill", that.opts.roadColorsHover[i % 2]);
                        });

                        // change address boxes background color
                        gBox.selectAll("g").each(function () {
                            var _obj = d3.select(this);
                            if (_obj.attr("id") == "boxObj_".concat(boxId)) _obj.select("rect").attr("fill", that.opts.boxHoverColor);
                            else {
                                var i = parseInt(_obj.attr("id").replace("boxObj_", ""));
                                _obj.select("rect").attr("fill", that.opts.boxColorsHover[i % 2]);
                            }
                        });

                        // show information panel
                        that.createInfoPanel(that.opts.data[index]);

                        jumpUp(_obj);
                    }, 150);
                })
                .on("mouseout", function () {
                    if (setTimeoutConst != 0) {
                        clearTimeout(setTimeoutConst);
                        return;
                    }
                    var _obj = d3.select(this);

                    //if (that.clicked) return;
                    if (_obj.attr("clicked") == "true") return;

                    var boxId = _obj.attr("boxIndex");
                    //var imgNum = _obj.attr("id").replace("imgObj_", "");
                    //var tarRoad = gPath.select("#roadObj_" + boxId);
                    //tarRoad.attr("fill", tarRoad.attr("oriColor")); // revert road background color
                    gPath.selectAll("path").each(function (d, i) {
                        var self = d3.select(this);
                        self.attr("fill", self.attr("oriColor"));
                    });
                    // revert address boxes background color
                    gBox.selectAll("rect").each(function () {
                        var _obj = d3.select(this);
                        _obj.attr("fill", _obj.attr("oriColor"));
                    });

                    // display summary information panel
                    that.createSummaryInfoPanel();

                    dropDown(_obj);
                })
                .on("click", function () {
                    var _obj = d3.select(this);
                    //if (that.clicked && _obj.attr("clicked") == "false") return;

                    var _clicked = _obj.attr("clicked");
                    if (_clicked == "false") {
                        //that.clicked = true;
                        _obj.attr("clicked", "true");
                    }
                    else {
                        //that.clicked = false;
                        _obj.attr("clicked", "false");
                    }
                });

        // draw summary information panel
        that.createSummaryInfoPanel();

        // draw legend
        that.createLegend(gLegend);
    },

    /* create the road animation */
    createAnimation: function () {
        var that = this;
        //var speed = 115;

        d3.timer(function () {
            if (that.animateFlage == -1 && that.milestoneLines[0].get("y1") <= that.bottomStartPoints.y
                || that.animateFlage == 1 && that.milestoneLines[that.milestoneLines.length - 2].get("y1") >= that.bottomStartPoints.y)
                that.animateFlage = 0;

            if (that.animateFlage == 0) {
                that.isRunning = false;
                return true;
            }

            // accelerated speed, max speed is 35.
            if (that.speed > 35) that.speed -= .85;

            for (var i = 0, ci; ci = that.milestoneLines[i]; i++) {
                var targetT = ci.get("targetT");
                var lastIndex = that.roadTopPoints.length - 1;

                if (that.animateFlage == 1) targetT += 1 / that.speed;
                else if (that.animateFlage == -1) targetT -= 1 / that.speed;

                var pos1, pos2;
                if (targetT < 0 || targetT > 1) {
                    var y = targetT * (that.bottomStartPoints.y - that.topStartPoints.y);
                    pos1 = { x: that.topStartPoints.x, y: y };
                    pos2 = { x: that.roadTopPoints[lastIndex].x, y: y };
                }
                else {
                    pos1 = that.getQuadraticBezierXYatT(
                        that.roadTopPoints[0],
                        {
                            x: that.roadTopPoints[0].x,
                            y: that.roadBottomPoints[0].y * that.bezierFactor
                        },
                        that.roadBottomPoints[0],
                        targetT);
                    pos2 = that.getQuadraticBezierXYatT(
                        that.roadTopPoints[lastIndex],
                        {
                            x: that.roadTopPoints[lastIndex].x,
                            y: that.roadBottomPoints[lastIndex].y * that.bezierFactor
                        },
                        that.roadBottomPoints[lastIndex],
                        targetT);
                }

                // update milestone line data
                ci.set("x1", Math.ceil(pos1.x));
                ci.set("y1", Math.ceil(pos1.y));
                ci.set("x2", Math.ceil(pos2.x));
                ci.set("y2", Math.ceil(pos2.y));
                ci.set("targetT", targetT);
                //ci.set("display", (pos1.y > that.bottomStartPoints.y || pos1.y < that.topStartPoints.y) ? "none" : "block");
                ci.set("display", (targetT > 1 || targetT < 0) ? "none" : "block");

                // update date text data
                var cj = that.dateTexts[i];
                cj.set("x", Math.ceil(pos2.x) + 15);
                cj.set("y", Math.ceil(pos1.y));
                cj.set("targetT", targetT);
                cj.set("fontSize", that.fontSize.min + parseFloat((that.fontSize.max - that.fontSize.min) * targetT));
                //cj.set("display", (pos1.y > that.bottomStartPoints.y || pos1.y < that.topStartPoints.y) ? "none" : "block");
                cj.set("display", (targetT > 1 || targetT < 0) ? "none" : "block");

                // update story image data
                for (var j = 0, ck; ck = that.storyImages[j]; j++) {
                    var dateIndex = ck.get("dateIndex");
                    if (dateIndex != cj.get("id").replace("dateObj_", "")) continue;

                    var boxId = ck.get("boxIndex");
                    var dayOfWeek = ck.get("dayOfWeek");
                    var tarT = targetT + parseFloat((1 / that.milestoneLineCount) * (dayOfWeek / 7));
                    var tarImageSize = that.imageSize.min + parseFloat((that.imageSize.max - that.imageSize.min) * tarT);

                    var pos = that.getQuadraticBezierXYatT(
                        {
                            x: that.roadTopPoints[boxId].x + that.roadWidthTop / 2,
                            y: that.roadTopPoints[boxId].y
                        },
                        {
                            x: that.roadTopPoints[boxId].x + that.roadWidthTop / 2,
                            y: (that.roadBottomPoints[boxId].y) * that.bezierFactor
                        },
                        {
                            x: that.roadBottomPoints[boxId].x + that.roadWidthBottom / 2,
                            y: that.roadBottomPoints[boxId].y
                        },
                        tarT);
                    if (tarT < 0 || tarT > 1) {
                        pos.y = tarT * (that.bottomStartPoints.y - that.topStartPoints.y);
                    }

                    var ishidden = ck.get("ishidden");
                    var display;
                    ck.set("x", tarImageSize < 0 ? Math.ceil(pos.x) : Math.ceil(pos.x - tarImageSize / 2));
                    ck.set("y", tarImageSize < 0 ? Math.ceil(pos.y) : Math.ceil(pos.y - tarImageSize));
                    ck.set("targetT", tarT);
                    ck.set("width", tarImageSize < 0 ? 0 : tarImageSize);
                    ck.set("height", tarImageSize < 0 ? 0 : tarImageSize);
                    if (ishidden == "true") display = "none";
                    else display = (pos.y > that.bottomStartPoints.y || (pos.y - (tarImageSize < 0 ? 0 : tarImageSize)) < that.topStartPoints.y) ? "none" : "block";
                    ck.set("display", display);
                    //ck.set("display", (tarT > 1 || tarT < 0) ? "none" : "block");
                }
            }

            // animate milestone lines
            var gLine = d3.select("#gLine");
            gLine.selectAll("line")
                .attr("x1", function (d) { return d.get('x1') })
                .attr("y1", function (d) { return d.get('y1') })
                .attr("x2", function (d) { return d.get('x2') })
                .attr("y2", function (d) { return d.get('y2') })
                .attr("display", function (d) { return d.get('display') })
                .attr("targetT", function (d) { return d.get('targetT') });

            // animate road dates
            var gRoadDate = d3.select("#gRoadDate");
            gRoadDate.selectAll("text")
                .attr("x", function (d) { return d.get('x') })
                .attr("y", function (d) { return d.get('y') })
                .attr("font-size", function (d) { return d.get('fontSize') })
                .attr("display", function (d) { return d.get('display') })
                .attr("targetT", function (d) { return d.get('targetT') })
                .each(function (d) {
                    // for FF, once element's display goes to 'none', the exact bounding box is no longer quite defined by the specs...
                    if (d.get('display') != "none") {
                        d.width = this.getBBox().width;
                        d.height = this.getBBox().height;
                    }
                });
            for (var j = 0, dt; dt = that.dateTexts[j]; j++) {
                gRoadDate.select("#dateRectObj_" + j)
                    .attr("x", dt.get("x") - 10)
                    .attr("y", dt.get("y") - dt.height + 3)
                    .attr("width", dt.width + 20)
                    .attr("height", dt.height)
                    .attr("display", dt.get('display'));
            }

            // animate start arrow sign
            var arrowSignStart = d3.select("#arrowSignStart");
            var arrowSignStartPoints = { x: that.bottomStartPoints.x + that.bottomWidth / 2, y: that.milestoneLines[0].get("y1") };
            arrowSignStart.attr("transform", "translate(" + arrowSignStartPoints.x + ", " + arrowSignStartPoints.y + ") scale(3)");
            arrowSignStart.attr("display", (arrowSignStartPoints.y - 180) > that.bottomStartPoints.y ? "none" : "block");

            // animate end arrow sign
            var arrowSignEnd = d3.select("#arrowSignEnd");
            var _y = that.milestoneLines[that.milestoneLines.length - 1].get("y1") - ((that.bottomStartPoints.y - that.topStartPoints.y) / 2.2);
            var arrowSignStartPoints = { x: that.bottomStartPoints.x + that.bottomWidth / 2, y: _y };
            arrowSignEnd.attr("transform", "translate(" + arrowSignStartPoints.x + ", " + arrowSignStartPoints.y + ") scale(1.6)");
            //arrowSignEnd.attr("display", (arrowSignStartPoints.y - 180) > that.bottomStartPoints.y ? "none" : "block");

            // animate story images
            var gImage = d3.select("#gImage");

            gImage.selectAll("image")
                .attr("x", function (d) { return d.get('x'); })
                .attr("y", function (d) { return d.get('y'); })
                .attr("targetT", function (d) { return d.get('targetT'); })
                .attr("width", function (d) { return d.get('width'); })
                .attr("height", function (d) { return d.get('height'); })
                .attr("display", function (d) { return d.get('display'); });
        });
    }
}

// Get unique values of an Array
Array.prototype.Unique = function () {
    var n = [];
    for (var i = 0; i < this.length; i++) {
        if (n.indexOf(this[i]) == -1) n.push(this[i]);
    }
    return n;
}

// string format function extersion
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function (m, i) {
            return args[i];
        });
}

// Format Date string.
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // month 
        "d+": this.getDate(), // date
        "h+": this.getHours(), // hour 
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds() // millisecond
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// Get numbers of days between two dates
function getDateDiff(dateStart, dateEnd) {
    var strDateS = new Date(dateStart);
    var strDateE = new Date(dateEnd);
    return parseInt((strDateE - strDateS) / 1000 / 60 / 60 / 24);
}

// Add days to the given date object
function addDates(date, days) {
    var newDate = new Date(date.toString());
    return new Date(newDate.setDate(newDate.getDate() + days));
}

/************ initialize ************/
//$(function () {
//    $(".sel_trade").change(function () {
//        var hid = $(this).val();
//        $(this).next().html(getGSHtml(hid));
//        $(".sel_company").change();
//    });
//
//    function getHYHtml() {
//        var dataHY = getCompanyData();
//        var selHtml = "";
//        for (var i = 0; i < dataHY.length; i++) {
//            selHtml += "<option value='" + dataHY[i].HYID + "'>" + dataHY[i].HYMC + "</option>";
//        }
//        return selHtml;
//    }
//
//    function getGSHtml(hyId) {
//        var dataHY = getCompanyData();
//        var gsHtml = "";
//        for (var i = 0; i < dataHY.length; i++) {
//
//            if (dataHY[i].HYID == hyId) {
//
//                for (var j = 0; j < dataHY[i].HYGS.length; j++) {
//                    gsHtml += "<option value='" + dataHY[i].HYGS[j].GSID + "'>" + dataHY[i].HYGS[j].GSMC + "</option>";
//                }
//                break;
//            }
//        }
//        return gsHtml;
//    }
//
//    function initailSelector() {
//        $(".sel_trade").html(getHYHtml());
//        $(".sel_trade").change();
//    }
//
//    initailSelector();
//
//    var roadCtrl = new roadChart({
//        width: $(document).width() - 200,
//        height: $(document).height() - $(".title_top").height(),
//        data: eval("road_data".concat($(".sel_company").val())),
//        title: $(".sel_company:first option:selected").text().concat('企业画像')
//    });
//    roadCtrl.draw();
//
//
//    $(".sel_company").change(function () {
//        var cid = $(this).val();
//        roadCtrl.opts.data = eval("road_data".concat(cid));
//        roadCtrl.opts.title = $(".sel_company:first option:selected").text().concat('企业画像');
//        roadCtrl.draw();
//    });
//});