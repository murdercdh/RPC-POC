/**
 * Created by Guoliang on 2014/12/1.
 */

var compareArray = [];
$(function () {

    var allData = resultListJson();

    var dataJson = [];
    var dataSurce = ko.observableArray(dataJson);


    //改变行业事件
    $(".sel_trade").change(function () {
        var hid = $(this).val();
        $(this).next().html(getGSHtml(hid));
        $(".sel_company").change();
    });


    //改变公司事件
    $(".sel_company").change(function () {
        var cid = $(".sel_company").val();

        dataJson = getNewsByCompanyId(cid);
        dataSurce(dataJson);
        //绑定条件下拉框
        getLocationsFromNews(dataJson);
        $(".input_date").val("");
    });
    $("#btn_road").click(function () {

    });
    $("#btn_compare").click(function () {
        if (compareArray.length == 0) {
            alert("请添加对比公司！");
            return
        }
        var cids = "";
        for (var i = 0; i < compareArray.length; i++) {
            if (i == compareArray.length - 1) {
                cids += compareArray[i];
            } else {
                cids += compareArray[i] + "-";
            }
        }
        window.location.href = 'compare.html?cids=' + cids;
    });

    $("#btn_AddCC").click(function () {

        var comId = $(".sel_company").val();
        var hasId = false;
        for (var i = 0; i < compareArray.length; i++) {
            if (compareArray[i] == comId) {
                hasId = true;
                break;
            }
        }
        if (!hasId) {
            compareArray.push(comId);
        }
        $(this).text("+对比(" + compareArray.length + ")");
    });

    //加载更多
    $(".search_load_more span.more").click(function () {
        var cid = $(".sel_company").val();
        var comData = getNewsByCompanyId(cid);

        var minRdVal = Math.floor(Math.random() * (comData.length - 6));

        console.log("数据长度：" + comData.length);

        var maxRdVal = minRdVal + 5;
        console.log(minRdVal + "---" + maxRdVal);
        var tempData = comData.slice(minRdVal, maxRdVal);

        for (var o in tempData) {
            dataJson.push(tempData[o]);
        }
        dataSurce(dataJson);
        if (dataJson.length > 50) {
            // $(this).hide();
        }
    });
    $(".input_date").datetimepicker({
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
        var HYID = $(".sel_trade").val();
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

    //获取行业optionHtml
    function getHYHtml() {
        var dataHY = allData;
        var selHtml = "";
        for (var i = 0; i < dataHY.length; i++) {
            selHtml += "<option value='" + dataHY[i].HYID + "'>" + dataHY[i].HYMC + "</option>";
        }
        return selHtml;
    }

    //根据行业ID获取公司列表
    function getGSByHyId(hyId) {
        var HYGS = [];
        for (var i = 0; i < allData.length; i++) {
            if (allData[i].HYID == hyId) {
                HYGS = allData[i].HYGS;
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

    //初始化行业和公司
    function initailSelector() {
        $(".sel_trade").html(getHYHtml());
        $(".sel_trade").change();
    }

    getList();
    initailSelector();

})