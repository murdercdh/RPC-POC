/**
 * Created by Jacky on 1/9/2015.
 */
var compareArray = [];//要对比的公司ID
$(function () {
    $("html").niceScroll({
        cursorwidth: 8
    });

    $(".mgo").click(function () {
        //$(".mgo").prev().removeClass("mcur");
        //$(this).prev().addClass("mcur")

        var target = $(this).attr("tag");
        $(".compare_company").each(function () {
            $(this).find(".block_container:gt(0)").hide();
        });
        //$("." + target).fadeIn(50);
        $("." + target).show();
        $(".mico").removeClass("mcur");
        $(".mgo").blur().removeClass("mgo-cur");
        $(this).addClass("mgo-cur");
        $(this).prev(".mico").addClass("mcur");
        //var target = $(this).attr("tag");
        //var sTop = $("." + target).offset().top;
        //$("html,body").animate({scrollTop: sTop}, 500);
    });

    //$('#tabs-3').on('mousewheel DOMMouseScroll', function(e) {
    //    console.log("123123");
    //});

    //$(window).scroll(function () {
    //    if (compareArray.length == 0) {
    //        return;
    //    }
    //    var h1 = $(".md1").offset().top + $(".md1").height();
    //    var h2 = $(".md2").offset().top + $(".md2").height();
    //    var h3 = $(".md3").offset().top + $(".md3").height();
    //    var h4 = $(".md4").offset().top + $(".md4").height();
    //    var h5 = $(".md5").offset().top + $(".md5").height();
    //    var h6 = $(".md6").offset().top + $(".md6").height();
    //    var sT = $(window).scrollTop();
    //
    //    $(".mico").removeClass("mcur");
    //    $(".mgo").blur().removeClass("mgo-cur");
    //
    //    if (sT >= 0 && sT <= h1) {
    //        $(".mgo[tag='md1']").addClass("mgo-cur").prev().addClass("mcur");
    //    }
    //    if (sT > h1 && sT <= h2) {
    //        $(".mgo[tag='md2']").addClass("mgo-cur").prev().addClass("mcur");
    //    }
    //    if (sT > h2 && sT <= h3) {
    //        $(".mgo[tag='md3']").addClass("mgo-cur").prev().addClass("mcur");
    //    }
    //    if (sT > h3 && sT <= h4) {
    //        $(".mgo[tag='md4']").addClass("mgo-cur").prev().addClass("mcur");
    //    }
    //    if (sT > h4 && sT <= h5) {
    //        $(".mgo[tag='md5']").addClass("mgo-cur").prev().addClass("mcur");
    //    }
    //    if (sT > h5 && sT <= h6) {
    //        $(".mgo[tag='md6']").addClass("mgo-cur").prev().addClass("mcur");
    //    }
    //})
    //获取当前显示的tab
    function getTab() {
        var tbIndex = window.location.href.split("#")[1];
        var tabName = "tabs-1";
        if (tbIndex == "graphics") {
            tabName = "tabs-1";
        }
        if (tbIndex == "analysis") {
            tabName = "tabs-2";
        }
        if (tbIndex == "compare") {
            tabName = "tabs-3";
        }
        return tabName;
    }


    $("#btn_AddCom").hide();
    /* tabs初始化和事件绑定 */
    $("#nav-bar .tabs").each(function (i, el) {
        var obj = $(el);
        //var curTab=getTab();
        //obj.attr("id")==curTab
        if (i == 0) {
            obj.addClass("tabs-active");
            obj.attr("active", "true");
            $("#" + obj.attr("contentId")).show();
        }
        else {
            obj.attr("active", "false");
            $("#" + obj.attr("contentId")).hide();
        }
    });


    $("#nav-bar .tabs").hover(function () {
            var self = $(this);
            if (self.attr("active") != "true")
                self.addClass("tabs-hover");
        },
        function () {
            var self = $(this);
            if (self.attr("active") != "true")
                self.removeClass("tabs-hover");
        });

    $("#nav-bar .tabs").click(function () {
        var self = $(this);
        if (self.attr("active") != "true") {
            self.attr("active", "true");
            self.removeClass("tabs-hover");
            self.addClass("tabs-active");
            $("#nav-bar .tabs").each(function (i, el) {
                var obj = $(el);
                // hide
                if (!obj.is(self)) {
                    obj.attr("active", "false");
                    obj.removeClass("tabs-active");
                    $("#" + obj.attr("contentId")).hide();
                }
                // show
                else {
//                    $("#" + obj.attr("contentId")).show("easeOutCirc");
                    if (i == 2) {
                        $("#tab_sel_trade").hide();
                        $("#tab_sel_company").hide();
                        $("#btn_AddCom").show();
                    }
                    else {
                        $("#tab_sel_trade").show();
                        $("#tab_sel_company").show();
                        $("#btn_AddCom").hide();
                    }
                    var tmp = $("#" + obj.attr("contentId"));
                    if (i == 0) {
                        // in Firefox, 'NS_ERROR_FAILURE' error will occur for SVG graphic if display is 'none'.
                        // so we have to show the graphic first, then refresh and hide it.
                        tmp.show();
                        refreshRoad();
                        tmp.hide();
                    }
                    tmp.show("fade", 600);
                }
            });
        }
    });
    /* tabs end */
    var dataAll = resultListJson();
    var activeTypes = ["宣传", "合作", "签约"];
    var dataJson = [];
    var dataSurce = ko.observableArray(dataJson);

    //获取行业optionHtml
    function getHYHtml() {
        var dataHY = dataAll;
        var selHtml = "";
        for (var i = 0; i < dataHY.length; i++) {
            selHtml += "<option value='" + dataHY[i].HYID + "'>" + dataHY[i].HYMC + "</option>";
        }
        return selHtml;
    }

    //根据行业ID获取公司列表
    function getGSByHyId(hyId) {
        var HYGS = [];
        for (var i = 0; i < dataAll.length; i++) {
            if (dataAll[i].HYID == hyId) {
                HYGS = dataAll[i].HYGS;
                break;
            }
        }
        return HYGS;
    }

    //获取公司optionHtml
    function getGSHtml(hyId) {
        var HYGS = getGSByHyId(hyId);
        var gsHtml = "";
        for (var i = 0; i < HYGS.length; i++) {
            gsHtml += "<option value='" + HYGS[i].GSID + "'>" + HYGS[i].GSMC + "</option>";
        }
        return gsHtml;
    }

    //改变行业事件
    $("#tab_sel_trade").change(function () {
        var hid = $(this).val();
        $(this).next().html(getGSHtml(hid));
        $("#tab_sel_company").change();
    });

    //改变公司事件
    $("#tab_sel_company").change(function () {
        var cid = $(this).val();

        if ($("#nav-bar .tabs:eq(0)").attr("active") == "true") {
            refreshRoad();
        }
        // 刷新分析模式数据
        dataJson = getNewsByCompanyId(cid);
        dataSurce(dataJson);
        //绑定条件下拉框
        getLocationsFromNews(dataJson);
        $(".input_date").val("");
    });

    // +对比按钮事件
    $("#btn_AddCom").click(function () {
        $("#modal_Company").modal("show");
        initalCompareCompanySpan();
        $("#sel_trade").change();
    });


    $("#btn_AddCC").click(function () {
        var cid = $("#modal_Company .sel_company").val();
        var cname = $("#modal_Company .sel_company option:selected").text();
        var comHtml = "<span title='点击删除' class='compare_com' cid='" + cid + "'>" + cname + "</span>";
        if ($("#list_company span.compare_com[cid='" + cid + "']").length == 0) {
            $("#list_company").append(comHtml);
        }
    });

    //弹出层确定按钮
    $("#btn_SelOK").click(function () {

        compareArray = [];
        $("#list_company span.compare_com").each(function () {
            var cid = $(this).attr("cid");
            compareArray.push(cid);
        });
        $("#modal_Company").modal("hide")
        $("#btn_AddCom").text("+对手(" + compareArray.length + ")")
        BindAllData();
    });

    $("span.compare_com").live("click", function () {
        $(this).remove();
    });

    //改变行业事件
    $("#sel_trade,.sel_trade").live("change", function () {
        var hid = $(this).val();
        $(this).next().html(getGSHtml(hid));
    });

    // 删除对比公司事件
    $(".compare_company div.del_ico").live("click", function () {
        var $container = $(this).parents(".compare_company")
        var cid = $container.attr("comid");
        var newArray = [];
        for (var i = 0; i < compareArray.length; i++) {
            if (compareArray[i] != cid) {
                newArray.push(compareArray[i])
            }
        }
        compareArray = newArray;
        BindAllData();
    });

    function BindAllData() {
        initalCompareHtml();
        initalCompareData();
        changeSelector();
        // $(".sel_trade").change();
        $("#btn_AddCom").text("+对比(" + compareArray.length + ")");

    }

    //初始化对比公司的HTML
    function initalCompareHtml() {
        if (compareArray.length > 0) {
            $(".lineContent").show();
        }
        else {
            $(".lineContent").hide();
        }
        $(".content").html("");
        for (var i = 0; i < compareArray.length; i++) {
            if (!isNaN(compareArray[i])) {
                var companyHtml = $("<div class='compare_company' comId='" + compareArray[i] + "'><div class='block_container'><div class='block_search'><select class='select_nomal sel_trade'></select><select class='select_nomal sel_company'></select><div class='del_ico' title='删除'></div></div></div><div class='block_container md1'><div class='block_title'><span class='ico'></span>业务信息曝光量</div><div class='block_content'><div class='be_com'></div></div></div><div class='block_container md2'><div class='block_title'><span class='ico'></span>活动分布</div><div class='block_content'><div class='m_com'></div></div></div><div class='block_container md3'><div class='block_title'><span class='ico'></span>业务活动统计</div><div class='block_content'><div class='bp_com'></div><div class='table_container bp_com_tb'><table class='table_list line_height25'><thead><tr><th style=' width:100px;'></th><th>宣传</th><th>合作</th><th>签约</th></tr></thead><tbody></tbody></table></div></div></div><div class='block_container md4'><div class='block_title'><span class='ico'></span>业务地域分布</div><div class='block_content'><div class='table_container bp_com_tb'><div class='table_list overhidden cus_com'></div></div></div></div><div class='block_container md5'><div class='block_title'><span class='ico'></span>高管曝光量</div><div class='block_content'><div class='ee_com'></div></div></div><div class='block_container md6'><div class='block_title'><span class='ico'></span>高管分工统计</div><div class='block_content'><div class='hm_com'><div class='table_container bp_com_tb'><table class='line_height25'><tbody></tbody></table></div></div></div></div>");
//<table class='table_list'><thead><tr><th style=' width:100px;'>业务</th><th>分布</th></tr></thead><tbody></tbody></table>
                $(".content").append(companyHtml);
            }
        }
        initailCompareSelector();
        initalWith();

    }

    function initalWith() {
        $(".content .block_content").niceScroll({
            cursorwidth: 8
        });
        var comCount = $(".compare_company").length;
        $(".content").width(comCount * 600);
        var winHeight = $(window).height();
        //$(".compare_company").each(function () {
        //    $(this).find(".block_container:gt(0)").find(".block_content").height(winHeight - 50);
        //})
    }

    function initalCompareData() {
        $(".compare_company").each(function () {
            var cid = $(this).attr("comid");
            setCompanyData(cid);
        });
        $(".mgo:first").click();
    }

    //为某个公司绑定数据
    function setCompanyData(comId) {

        var beData = getCompanyBiz(comId);

        $(".compare_company[comid='" + comId + "'] .be_com").pieChart({pData: beData});

        //旧版图标bar
        //$(".compare_company[comid='" + comId + "'] .hm_com").barChart({
        //    category: hmData.category,
        //    pData: hmData.data
        //});

        var bizProceeData = getBusinessActiveSum(comId);
        //$(".compare_company[comid='" + comId + "'] .bp_com").barChart({
        //    category: bizProceeData.category,
        //    pData: bizProceeData.data
        //});

        var ywHtml = "";
        //var ywHtml = "<thead><tr><td></td>";
        //
        //for(var i=0;i<bizProceeData.actives.length;i++){
        //    ywHtml+="<td>"+bizProceeData.actives[i]+"</td>";
        //}
        //ywHtml+="</tr></thead>";
        for (var i = 0; i < bizProceeData.category.length; i++) {
            ywHtml += "<tr><td class='padding_left'>" + bizProceeData.category[i] + "</td>";
            var maxArray = [];
            for (var j = 0; j < bizProceeData.data.length; j++) {
                maxArray.push(bizProceeData.data[j].data[i]);
            }
            var maxValue = Math.max.apply(null, maxArray);
            for (var j = 0; j < bizProceeData.data.length; j++) {
                var cls = "";
                if (maxValue == bizProceeData.data[j].data[i] && maxValue != 0) {
                    cls = "maxCount";
                }
                ywHtml += "<td class='" + cls + "'>" + bizProceeData.data[j].data[i] + "</td>"
            }
            ywHtml += "</tr>"
        }

        //for (var i = 0; i < bizProceeData.length; i++) {
        //    ywHtml += "<tr><td>" + companyData.YWJZ[i].YW + "</td><td>" + companyData.YWJZ[i].KH + "</td><td>" + companyData.YWJZ[i].ZH + "</td><td>" + companyData.YWJZ[i].LT + "</td></tr>";
        //}
        $(".compare_company[comid='" + comId + "'] .bp_com_tb table tbody").html(ywHtml);

        $(".bp_com_tb tr").each(function () {
            var td3=$(this).find("td:eq(3)");
            if (td3.text() > 0) {
                td3.addClass("sign")
            }
        });

        var objRandom={};
        objRandom.l=0;//left
        objRandom.t=0;//top
        objRandom.w=0;//width
        objRandom.h=0;//height

        var objs=[];

       // objs.push({l:0,t:0,w:0,h:0});

        function hasObj(obj){

            var has=false;
            for(var i=0;i<objs.length;i++){

                var xd=(obj.w+objs[i].w)/2;//X轴和的一半
                var xr=Math.abs((obj.l+obj.w/2)-(objs[i].l+objs[i].w/2));//X轴轴心距
                var yd=(obj.h+objs[i].h)/2;//X轴和的一半
                var yr=Math.abs((obj.t+obj.h/2)-(objs[i].t+objs[i].h/2));//X轴轴心距

                if(xr<xd&&yr<yd)
                //if(((obj.l>(objs[i].l+objs[i].w)||(obj.l+obj.w)<objs[i].l)&&(obj.t>(objs[i].t+objs[i].h)||(obj.t+obj.h)<objs[i].t))==false)
               // if(obj.l>objs[i].l&&obj.l<(objs[i].l+objs[i].w)||(obj.l+obj.w)>objs[i].l&&(obj.l+obj.w)<(objs[i].l+objs[i].w))
              //  if((obj.l>objs[i].l&&obj.l<(objs[i].l+objs[i].w)||(obj.l+obj.w)>objs[i].l&&(obj.l+obj.w)<(objs[i].l+objs[i].w))&&(obj.t>objs[i].t&&obj.t<(objs[i].t+objs[i].h)||(obj.t+obj.h)>objs[i].t&&(obj.t+obj.h)<(objs[i].t+objs[i].h)))
                //if((obj.l>(objs[i].l+objs[i].w)||(obj.l+obj.w)<objs[i].l)&&(obj.t>(objs[i].t+objs[i].h)||(obj.t+obj.h)<objs[i].t)==false)//有相交部分
                {
                    has=true;
                    break;
                }
            }
            if(!has){
                var temobj=new Object();
                temobj.l=obj.l;
                temobj.t=obj.t;
                temobj.w=obj.w;
                temobj.h=obj.h;
                objs.push(temobj);
            }
            return has;
        }

        //var oPosition = {};
        //oPosition.x = 0;
        //oPosition.y = 0;
        //
        //var aX =[];
        //var aY = [];
        //// 是否相互影响。
        //function isInteractOnEachOther(oPos,w,h)
        //{
        //    var bIsInteract = false;
        //    for (var i=0; i<aX.length; i++)
        //    {
        //        if ((((oPos.x+w)>aX[i])&&((oPos.x-w)<aX[i])) && (((oPos.y+h)>aY[i])&&((oPos.y-h)<aY[i])))
        //        {
        //            bIsInteract = true;
        //            break;
        //        }
        //    }
        //    if (!bIsInteract)
        //    {
        //        aX[aX.length] = oPos.x;
        //        aY[aY.length] = oPos.y;
        //    }
        //    return bIsInteract;
        //}

        var bizDisData = getBusinessDistribute(comId)
        var khHtml = "";
        for (var i = 0; i < bizDisData.length; i++) {

            var bLength = bizDisData[i].distribute.split(" ").length - 1;
            var r = 10;
            if (bLength <= 2) {
                r = 20;
            }
            else if (bLength <= 4) {
                r = 30;
            }
            else{
                r = 40;
            }
            var pad = r - ((r * r) / (1.8 * r));
            var border = 2 * r;

            var color=randomColor(i);
            var areaHtml="";
            for(var j=0;j<bLength;j++){
                areaHtml+="<span class='cityname'>"+bizDisData[i].distribute.split(" ")[j]+"</span>";
            }
            khHtml += "<div class='area_container'><div title='"+bizDisData[i].distribute+"' class='areas' style='width:" + border + "px;height:" + border + "px;padding:" + pad + "px;background-color:"+color+"'>" + areaHtml + "</div><div class='service' style='color:"+color+"'>" + bizDisData[i].bizName + "</div></div>"
            //khHtml += "<tr><td>" + bizDisData[i].bizName + "</td><td>" + bizDisData[i].distribute + "</td></tr>";
        }
        $(".compare_company[comid='" + comId + "'] .cus_com").html(khHtml);
     //   var cw=$(".compare_company[comid='" + comId + "'] .block_container").width();
        var cw=419;
        $(".compare_company[comid='" + comId + "'] .area_container").each(function(i,o){
            var ow=$(this).outerWidth();
          //  console.log(ow);
            var w=$(o).find(".areas").outerWidth();
            var h=$(o).find(".areas").outerHeight()+35;
            objRandom.w=w;
            objRandom.h=h;
            var ph=450;
            var ri=0;
            do
            {
                objRandom.l= Math.ceil(Math.random()*(cw-w-5));
                objRandom.t= Math.ceil(Math.random()*(ph-h));
                ri+=1;
                if(ri>30){
                    ph+=30;
                }
               // alert(objRandom.l+";t:"+objRandom.t+"w:"+objRandom.w+"h:"+objRandom.h)
              //  console.log(w);
              //  oPosition.x = Math.ceil(Math.random()*(cw-w));
              //  oPosition.y = Math.ceil(Math.random()*(600-h));
            }
            //while (isInteractOnEachOther(oPosition,w,h));
            while (hasObj(objRandom));
            console.log(objRandom);
            $(o).css({"left":objRandom.l,"top":objRandom.t});
            //obj_divs[i].style.left = oPosition.x + "px";
            //obj_divs[i].style.top = oPosition.y + "px";

        })
        var actData = getCompanyActive(comId);
        $(".compare_company[comid='" + comId + "'] .m_com").columnChart({category: ["宣传", '合作', '签约'], pData: actData});

        var highManagerData = getCompanyhighManger(comId);
        $(".compare_company[comid='" + comId + "'] .ee_com").pieChart({pData: highManagerData});

        //高管分工统计绑定数据
        var hmData = getHightManagerSum(comId, 3);
        var hmHtml = "";
        for (var i = 0; i < hmData.length; i++) {
            hmHtml += "<tr><td><span class='hmname'>" + hmData[i].user + "</span></td><td class='padding_left'>"
            for (var j = 0; j < hmData[i].buss.length; j++) {
                hmHtml += "<span class='buss'>" + hmData[i].buss[j].bname + ":<span class='maxNum'>" + hmData[i].buss[j].count + "</span></span>"
            }
            hmHtml += "</td></tr>";
        }
        $(".compare_company[comid='" + comId + "'] .hm_com table tbody").html(hmHtml)

    }

    function randomColor(index){
        var colors=[ "#fffc9e","#d13a1f","#f472d0","#9b4f96","#0174bf","#6dc2e9","#00d8cc","#8ccf70","#e2e584","#ff8c00","#d90000","#ec008c","#68217a","#00188f","#00b294","#009e49","#bad08a"];
        var ind=parseInt(Math.random()*(18-1+1)+1);
        if(index){
            ind=index;
        }
        var color=colors[ind];
        return color;
    }

    //绑定对比的公司名称
    function changeSelector() {
        $(".compare_company").each(function () {
            var cid = $(this).attr("comid");
            for (var i = 0; i < dataAll.length; i++) {
                for (var j = 0; j < dataAll[i].HYGS.length; j++) {
                    if (dataAll[i].HYGS[j].GSID == cid) {
                        $(this).find(".sel_trade").val(dataAll[i].HYID).change();
                        $(this).find(".sel_company").val(cid);
                        break;
                    }
                }
            }
        });
    }

    function initalUrl() {
        if (compareArray.length == 0) {
            alert("请选择对比公司！");
            return;
        }
        BindAllData();
        //var cids = "";
        //for (var i = 0; i < compareArray.length; i++) {
        //    if (i == compareArray.length - 1) {
        //        cids += compareArray[i];
        //    } else {
        //        cids += compareArray[i] + "-";
        //    }
        //}
        //window.location.href = 'compare.html?cids=' + cids;
    }

    //获取公司业务曝光量------
    function getCompanyBiz(cid) {
        var bizData = [];
        var tempObj = {};
        var comNewsData = getCompanyDataById(cid).GSXW;//要修改为动态
        //获取每个关键字出现的次数
        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempObj.hasOwnProperty(comNewsData[i].theme)) {
                tempObj[comNewsData[i].theme] = 1;
            }
            else {
                tempObj[comNewsData[i].theme] += 1;
            }
        }
        for (var attr in tempObj) {
            var percent = tempObj[attr] / comNewsData.length;
            bizData.push([attr, percent])
        }
        return bizData;
    }

    //获取公司活动分布------
    function getCompanyActive(cid) {
        var actData = [];
        var tempObj = {};
        tempObj["宣传"] = 0;
        tempObj["合作"] = 0;
        tempObj["签约"] = 0;
        var tempNewsData = getCompanyDataById(cid).GSXW;//要修改为动态
        var comNewsData = $.grep(tempNewsData, function (item) {
            return item.actType.indexOf(activeTypes[0]) > -1 || item.actType.indexOf(activeTypes[1]) > -1 || item.actType.indexOf(activeTypes[2]) > -1
        })

        //获取每个关键字出现的次数
        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempObj.hasOwnProperty(comNewsData[i].actType)) {
                tempObj[comNewsData[i].actType] = 1;
            }
            else {
                tempObj[comNewsData[i].actType] += 1;
            }
        }
        for (var attr in tempObj) {
            var percent = (tempObj[attr] / comNewsData.length) * 100;

            //actData.push([attr, percent])
            actData.push(parseFloat(percent.toFixed(2)))
        }
        return actData;
    }

    //获取高管曝光量------
    function getCompanyhighManger(cid) {
        var hmData = [];
        var tempObj = {};
        var comNewsData = getCompanyDataById(cid).GSXW;//要修改为动态
        //获取每个关键字出现的次数
        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempObj.hasOwnProperty(comNewsData[i].name)) {
                tempObj[comNewsData[i].name] = 1;
            }
            else {
                tempObj[comNewsData[i].name] += 1;
            }
        }
        for (var attr in tempObj) {
            var percent = tempObj[attr] / comNewsData.length;
            hmData.push([attr, percent])
        }
        return hmData;
    }

    //获取公司客户分布
    function getBusinessDistribute(cid) {
        var tempObj = {};
        var comNewsData = getCompanyDataById(cid).GSXW;

        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempObj.hasOwnProperty(comNewsData[i].theme)) {
                tempObj[comNewsData[i].theme] = "";
            }
        }
        var returnData = [];
        for (var attr in tempObj) {
            var tempArea = {};
            var areaString = "";
            for (var i = 0; i < comNewsData.length; i++) {
                if (attr == comNewsData[i].theme && !tempArea.hasOwnProperty(comNewsData[i].location)) {
                    tempArea[comNewsData[i].location] = "";
                    areaString += comNewsData[i].location + " ";
                }
            }
            //areaString = areaString.substr(0, areaString.length - 1);
            var obj = {bizName: attr, distribute: areaString};
            returnData.push(obj);
        }
        return returnData;
    }

    //获取业务活动统计
    function getBusinessActiveSum(cid) {
        var returnData = {category: [], actives: [], data: []};//{category:[],data:[{name:'客户',data:[4,2,5,7]},{name:'客户',data:[4,,32,5]},{name:'客户',data:[4,2,2,5]}]};

        var temNewsData = getCompanyDataById(cid).GSXW;
        var comNewsData = $.grep(temNewsData, function (item) {
            return item.actType.indexOf(activeTypes[0]) > -1 || item.actType.indexOf(activeTypes[1]) > -1 || item.actType.indexOf(activeTypes[2]) > -1
        });
        var tempObj = {};
        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempObj.hasOwnProperty(comNewsData[i].theme)) {
                tempObj[comNewsData[i].theme] = "";
                returnData.category.push(comNewsData[i].theme);
            }
        }
        var tempActive = {};
        for (var i = 0; i < activeTypes.length; i++) {
            tempActive[activeTypes[i]] = "";
            returnData.actives.push(activeTypes[i]);
        }
        //var tempActive={};
        //for(var i=0;i<comNewsData.length;i++){
        //    if(!tempActive.hasOwnProperty(comNewsData[i].actType)){
        //        tempActive[comNewsData[i].actType]="";
        //        returnData.actives.push(comNewsData[i].actType);
        //    }
        //}
        for (var a in tempActive) {//活动
            var obj = {name: "", data: []};//{name:'客户',data:[4,2,5,7]}
            obj.name = a;
            for (var b in tempObj) {//主题
                var themeCount = 0;
                for (var i = 0; i < comNewsData.length; i++) {
                    if (comNewsData[i].actType == a && comNewsData[i].theme == b) {
                        themeCount += 1;
                    }
                }
                obj.data.push(themeCount);
            }
            returnData.data.push(obj);
        }
        return returnData;
    }

    //获取高管分工统计
    function getHightManagerSum1(cid, topN) {
        var returnData = {category: [], actives: [], data: []};//{category:["人1","人2"],data:[{name:'客户',data:[4,2,5,7]},{name:'客户',data:[4,,32,5]},{name:'客户',data:[4,2,2,5]}]};

        //  var tempNewsData = getCompanyDataById(cid).GSXW;
        var comNewsData = getCompanyDataById(cid).GSXW;
        //取到所有人
        var tempUser = {};
        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempUser.hasOwnProperty(comNewsData[i].name)) {
                tempUser[comNewsData[i].name] = "";
                returnData.category.push(comNewsData[i].name);
            }
        }
        //取到所有业务
        var tempTheme = {};
        for (var i = 0; i < comNewsData.length; i++) {
            if (!tempTheme.hasOwnProperty(comNewsData[i].theme)) {
                tempTheme[comNewsData[i].theme] = "";
                // returnData.actives.push(comNewsData[i].theme);
            }
        }
        //取到原始数据
        var nameData = [];
        for (var a in tempUser) {//人物
            var dataObj = {name: a, themes: []};
            for (var b in tempTheme) {
                var tCount = 0;
                for (var i = 0; i < comNewsData.length; i++) {
                    if (comNewsData[i].name == a && comNewsData[i].theme == b) {
                        tCount += 1;
                    }
                }
                var tObj = {theme: b, Count: tCount};
                dataObj.themes.push(tObj);
            }
            nameData.push(dataObj);
        }
        //取到Top3并添加到元数组的一个新属性中
        for (var i = 0; i < nameData.length; i++) {
            var newthemes = nameData[i].themes.slice(0);
            newthemes.sort(function (a, b) {
                return b.Count - a.Count
            });
            nameData[i].topThemes = newthemes.slice(0, topN);//topN
        }
        //将top3 的添加isTop属性
        for (var i = 0; i < nameData.length; i++) {
            for (var j = 0; j < nameData[i].topThemes.length; j++) {
                for (var k = 0; k < nameData[i].themes.length; k++) {
                    if (nameData[i].topThemes[j].theme == nameData[i].themes[k].theme) {
                        nameData[i].themes[k].isTop = true;
                    }
                }
            }
        }
        //将第三名以外的全部置为0
        for (var i = 0; i < nameData.length; i++) {
            for (var j = 0; j < nameData[i].themes.length; j++) {
                if (!nameData[i].themes[j].hasOwnProperty("isTop")) {
                    nameData[i].themes[j].Count = 0;
                }
            }
        }
        //取到返回值
        for (var t in tempTheme) {
            var tData = {name: t, data: []};
            for (var i = 0; i < nameData.length; i++) {
                for (var j = 0; j < nameData[i].themes.length; j++) {
                    if (nameData[i].themes[j].theme == t) {
                        tData.data.push(nameData[i].themes[j].Count)
                    }
                }
            }
            returnData.data.push(tData);
        }

        //for(var i=0;i<nameData.length;i++){
        //    nameData[i].themes.sort(function(a,b){return b.Count- a.Count});
        //    var alength=nameData[i].themes.length-1;
        //    nameData[i].themes.splice(topn,alength);
        //}
        return returnData;
    }

    //获取高管分工统计
    function getHightManagerSum(cid, topN) {
        var tcomNewsData = getCompanyDataById(cid).GSXW;
        var comNewsData = $.grep(tcomNewsData, function (item) {
            return item.isAtten == 1
        })
        var returnData = [];// [{user: 'james', buss: [{bname: '业务A', count: 2}, {bname: '业务B', count: 32}]}];
        var users = [];
        for (var i = 0; i < comNewsData.length; i++) {
            if (!users.hasOwnProperty(comNewsData[i].name)) {
                users[comNewsData[i].name] = "";
                var tuer = {user: comNewsData[i].name, buss: []};
                returnData.push(tuer);
            }
        }
        //得到每个人的业务名称集合
        for (var i = 0; i < returnData.length; i++) {
            var tbus = {};
            for (var j = 0; j < comNewsData.length; j++) {
                if (returnData[i].user == comNewsData[j].name) {
                    if (!tbus.hasOwnProperty(comNewsData[j].theme)) {
                        tbus[comNewsData[j].theme] = "";
                        var pbus = {bname: comNewsData[j].theme, count: 0};
                        returnData[i].buss.push(pbus);
                    }
                }
            }
        }
        //计算每个人参数的新闻数
        for (var i = 0; i < comNewsData.length; i++) {
            for (var j = 0; j < returnData.length; j++) {
                for (var k = 0; k < returnData[j].buss.length; k++) {
                    if (comNewsData[i].name == returnData[j].user && comNewsData[i].theme == returnData[j].buss[k].bname) {
                        returnData[j].buss[k].count += 1;
                    }
                }
            }
        }
        for (var i = 0; i < returnData.length; i++) {
            returnData[i].buss.sort(function (a, b) {
                return b.count - a.count
            });
            returnData[i].buss = returnData[i].buss.slice(0, topN);

        }

        // console.warn(returnData)
        return returnData;
    }

    // 刷新跑道图
    function refreshRoad() {
        if (roadCtrl) {
            var cid = $("#tab_sel_company").val();
            roadCtrl.opts.data = eval("road_data".concat(cid));
            roadCtrl.opts.title = $("#tab_sel_company option:selected").text().concat('企业画像');
            roadCtrl.draw();
        }
    }

    //初始化行业和公司
    function initailCompareSelector() {
        $(".sel_trade").html(getHYHtml());
    }

    function initailSelector() {
        $("#tab_sel_trade").html(getHYHtml());
        $("#tab_sel_trade").change();
    }

    //加载更多
    $(".search_load_more span.more").click(function () {
        var cid = $(".sel_company").val();
        var comData = getNewsByCompanyId(cid);

        var minRdVal = Math.floor(Math.random() * (comData.length - 6));


        var maxRdVal = minRdVal + 5;
        var tempData = comData.slice(minRdVal, maxRdVal);
        console.warn(tempData)
        for (var i = 0; i < tempData.length; i++) {
            dataJson.push(tempData[i]);
        }
        dataSurce(dataJson);
        if (dataJson.length > 50) {
            // $(this).hide();
        }
    });

    $(".date").datetimepicker({
        language: 'zh-CN',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0,
        format: 'yyyy-mm-dd'
    });
    //$(".input_date").datetimepicker({
    //    language: 'zh-CN',
    //    weekStart: 1,
    //    todayBtn: 1,
    //    autoclose: 1,
    //    todayHighlight: 1,
    //    startView: 2,
    //    minView: 2,
    //    forceParse: 0,
    //    format: 'yyyy-mm-dd'
    //});

    $("#btn_search").click(function () {
        var keyword = $.trim($("#txt_keyword").val());
        var pCity = $("#sel_City").val();
        var pTheme = $("#sel_Theme").val();
        var pType = $("#sel_Type").val();

        var sDate = $("#start_Date").val();
        var eDate = $("#end_Date").val();

        //if ($.trim(keyword).length == 0 && pCity == "0" && pType == "0") {
        //    dataSurce(dataJson);
        //}
        //else {
        var searchData = dataJson;
        searchData = $.grep(dataJson, function (item) {
            var query = true;
            if (keyword.length > 0) {
                query = item.title.indexOf(keyword) > -1;
            }
            if (pCity != "") {
                query = query && item.location == pCity;
            }
            if (pTheme != "") {
                query = query && item.theme == pTheme;
            }
            if (pType != "") {
                query = query && item.actType == pType;
            }
            if (sDate != "") {
                query = query && new Date(item.time) >= new Date(sDate);
            }
            if (eDate != "") {
                query = query && new Date(item.time) <= new Date(eDate);
            }
            return query;
        });
        dataSurce(searchData);
        //}
    });

    //根据公司ID获取公司新闻列表
    function getNewsByCompanyId(cid) {
        var HYID = $("#tab_sel_trade").val();
        var GSData = getGSByHyId(HYID);
        var GSXW = [];
        for (var i = 0; i < GSData.length; i++) {
            if (GSData[i].GSID == cid) {
                GSXW = GSData[i].GSXW;
                break;
            }
        }
        return GSXW;
    }

    //根据公司ID获取公司名称
    function getCompanyNameById(cid) {
        var GSMC = "";
        //var dataAll = resultListJson();
        for (var i = 0; i < dataAll.length; i++) {
            for (var j = 0; j < dataAll[i].HYGS.length; j++) {
                if (dataAll[i].HYGS[j].GSID == cid) {
                    GSMC = dataAll[i].HYGS[j].GSMC;
                    break;
                }
            }
        }
        return GSMC;
    }

    //根据公司ID获取公司数据
    function getCompanyDataById(cid) {
        var returnData = null;
        for (var i = 0; i < dataAll.length; i++) {
            for (var j = 0; j < dataAll[i].HYGS.length; j++) {
                if (dataAll[i].HYGS[j].GSID == cid) {
                    returnData = dataAll[i].HYGS[j];
                    break;
                }
            }
        }

        returnData.GSXW = $.grep(returnData.GSXW, function (item) {
            return item.isAtten == 1;
        });
        // console.log(returnData);
        return returnData;
    }

    //点击弹出成显示已经对比的公司标签
    function initalCompareCompanySpan() {
        var comSpanHtml = "";
        for (var i = 0; i < compareArray.length; i++) {
            comSpanHtml += "<span title='点击删除' class='compare_com' cid='" + compareArray[i] + "'>" + getCompanyNameById(compareArray[i]) + "</span>";
        }
        $("#list_company").html(comSpanHtml);
    }

    //绑定下拉框数据
    function getLocationsFromNews(newsAll) {
        var tempObj = {};
        var tempTheme = {};
        var tempType = {};
        var locations = [];
        var themes = [];
        var types = [];

        for (var i = 0; i < newsAll.length; i++) {
            if (!tempObj.hasOwnProperty(newsAll[i].location)) {
                tempObj[newsAll[i].location] = '';
                locations.push(newsAll[i].location);
            }
            if (!tempTheme.hasOwnProperty(newsAll[i].theme)) {
                tempTheme[newsAll[i].theme] = '';
                themes.push(newsAll[i].theme);
            }
            if (!tempType.hasOwnProperty(newsAll[i].actType)) {
                tempType[newsAll[i].actType] = '';
                types.push(newsAll[i].actType);
            }
        }
        var cityHtml = "<option value=''>全部地点</option>";
        for (var i = 0; i < locations.length; i++) {
            cityHtml += "<option value='" + locations[i] + "'>" + locations[i] + "</option>";
        }
        $("#sel_City").html(cityHtml);

        var themeHtml = "<option value=''>全部主题</option>";
        for (var i = 0; i < themes.length; i++) {
            themeHtml += "<option value='" + themes[i] + "'>" + themes[i] + "</option>";
        }
        $("#sel_Theme").html(themeHtml);

        var typeHtml = "<option value=''>全部活动</option>";
        for (var i = 0; i < types.length; i++) {
            typeHtml += "<option value='" + types[i] + "'>" + types[i] + "</option>";
        }
        $("#sel_Type").html(typeHtml);
    }

    //获取列表
    function getList() {
        var ViewModel = function () {
            var self = this;
            self.objData = ko.observableArray([]);
            dataSurce = self.objData;
        }
        var lmodel = new ViewModel();
//        dataSurce(dataJson);

        ko.applyBindings(lmodel, document.getElementById("tb_result"));
    }

    getList();
    initailSelector();
    $("#sel_trade").html(getHYHtml());

    initialCompareData();
    //初始化时候默认显示软通和文思的对比
    function initialCompareData() {
        compareArray = [1, 2];
        $("#modal_Company").modal("hide")
        $("#btn_AddCom").text("+对手(" + compareArray.length + ")")
        BindAllData();
    }

    // 初始化跑道图
    var roadCtrl = new roadChart({
        width: $(document).width() - 200,
        height: $(document).height() - $(".title_top").height(),
        data: eval("road_data".concat($("#tab_sel_company").val())),
        title: $("#tab_sel_company option:selected").text().concat('企业画像')
    });
    roadCtrl.draw();
    initialTabs();
    function initialTabs() {
        var tabName = getTab();
        $(".tabs[contentid='" + tabName + "']").click();
    }

    //滚动切换对比项目
    $("#tabs-3").on("mousewheel DOMMouseScroll", function (e) {
        var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
            (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));
        if (delta > 0) {
            // 向上滚
            // console.log("wheelup");
            var prevMgo = $(".mgo-cur").parent().prev("li");
            if (prevMgo.length > 0) {
                prevMgo.find(".mgo").click();
            }
        } else if (delta < 0) {
            // 向下滚
            //console.log("wheeldown");
            var nextMgo = $(".mgo-cur").parent().next("li");
            if (nextMgo.length > 0) {
                nextMgo.find(".mgo").click();
            }
        }
    })

});