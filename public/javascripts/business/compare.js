/**
 * Created by Guoliang on 2014/12/2.
 */
///<reference path="../jQuery.js">
///<reference path="../iChart.js">
var compareArray = [];//要对比的公司ID
$(function () {

    var dataAll = resultListJson();

    var activeTypes = ["宣传", "合作", "签约"];

    $("#btn_AddCom").click(function () {
        $("#modal_Company").modal("show");
        initalCompareCompanySpan();
        $("#sel_trade").change();
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

    $("#btn_compare").click(function () {
        BindAllData();
    });

    $(".compare_company span.del_ico").live("click", function () {
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
        //var cids = "";
        //for (var i = 0; i < compareArray.length; i++) {
        //    if (i == compareArray.length - 1) {
        //        cids += compareArray[i];
        //    } else {
        //        cids += compareArray[i] + "-";
        //    }
        //}
        //window.location.href = 'compare.html?cids=' + cids;

    });


    $("#btn_anaylysis").click(function () {
        window.location.href = 'analysis.html';

    })

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

    $(".mgo").click(function () {
        //$(".mgo").prev().removeClass("mcur");
        //$(this).prev().addClass("mcur")
        var target = $(this).attr("href").split("#")[1];
        var sTop = $("." + target).offset().top;
        $("html,body").animate({scrollTop: sTop}, 500);

    });
    $(window).scroll(function () {
        var h1 = $(".md1").offset().top + $(".md1").height();
        var h2 = $(".md2").offset().top + $(".md2").height();
        var h3 = $(".md3").offset().top + $(".md3").height();
        var h4 = $(".md4").offset().top + $(".md4").height();
        var h5 = $(".md5").offset().top + $(".md5").height();
        var h6 = $(".md6").offset().top + $(".md6").height();
        var sT=$(window).scrollTop();
        console.log(sT);
        $(".mgo").removeClass("mgo-cur");
        if(sT>0&&sT<=h1){
            $(".mico").removeClass("mcur");
            $(".mgo").removeClass("mgo-cur");
            $(".mgo[href='#md1']").addClass("mgo-cur").prev().addClass("mcur");
        }
        if(sT>h1&&sT<=h2){
            $(".mico").removeClass("mcur");
            $(".mgo").removeClass("mgo-cur");
            $(".mgo[href='#md2']").addClass("mgo-cur").prev().addClass("mcur");
        }
        if(sT>h2&&sT<=h3){
            $(".mico").removeClass("mcur");
            $(".mgo").removeClass("mgo-cur");
            $(".mgo[href='#md3']").addClass("mgo-cur").prev().addClass("mcur");
        }
        if(sT>h3&&sT<=h4){
            $(".mico").removeClass("mcur");
            $(".mgo").removeClass("mgo-cur");
            $(".mgo[href='#md4']").addClass("mgo-cur").prev().addClass("mcur");
        }
        if(sT>h4&&sT<=h5){
            $(".mico").removeClass("mcur");
            $(".mgo").removeClass("mgo-cur");
            $(".mgo[href='#md5']").addClass("mgo-cur").prev().addClass("mcur");
        }
        if(sT>h5&&sT<=h6){
            $(".mico").removeClass("mcur");
            $(".mgo").removeClass("mgo-cur");
            $(".mgo[href='#md6']").addClass("mgo-cur").prev().addClass("mcur");
        }

    })


    //获取URL参数
    //function getUrlParam(name) {
    //    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    //    console.log(location);
    //    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    //    if (r != null) return unescape(r[2]);
    //    return null; //返回参数值
    //}

//根据公司ID获取公司名称
    function getCompanyNameById(cid) {

        var GSMC = "";
        var dataAll = resultListJson();
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

//点击弹出成显示已经对比的公司标签
    function initalCompareCompanySpan() {
        var comSpanHtml = "";
        for (var i = 0; i < compareArray.length; i++) {
            comSpanHtml += "<span title='点击删除' class='compare_com' cid='" + compareArray[i] + "'>" + getCompanyNameById(compareArray[i]) + "</span>";
        }
        $("#list_company").html(comSpanHtml);
    }


//初始化对比公司的HTML
    function initalCompareHtml() {
        //$(".content").html("");
        if (compareArray.length > 0) {
            $(".lineContent").show();
        }
        else{
            $(".lineContent").hide();
        }
            $(".content").html("");
            for (var i = 0; i < compareArray.length; i++) {
                if (!isNaN(compareArray[i])) {
                    var companyHtml = $(" <div class='compare_company' comId='" + compareArray[i] + "'><div class='block_container'><div class='block_search'><select class='select_nomal sel_trade'></select><select class='select_nomal sel_company'></select><span class='del_ico' title='删除'>╳</span></div></div><div class='block_container md1'><div class='block_title'><span class='ico'></span>业务信息曝光量</div><div class='block_content'><div class='be_com'></div></div></div><div class='block_container md2'><div class='block_title'><span class='ico'></span>业务活动统计</div><div class='block_content'><div class='bp_com'></div><div class='table_container bp_com_tb'><table class='table_list line_height20'><thead><tr><th style=' width:100px;'></th><th>宣传</th><th>合作</th><th>签约</th></tr></thead><tbody></tbody></table></div></div></div><div class='block_container md3'><div class='block_title'><span class='ico'></span>业务地域分布</div><div class='table_container'><div class='table_list cus_com'><table class='table_list'><thead><tr><th style=' width:100px;'>业务</th><th>分布</th></tr></thead><tbody></tbody></table></div></div></div><div class='block_container md4'><div class='block_title'><span class='ico'></span>活动分布</div><div class='block_content'><div class='m_com'></div></div></div><div class='block_container md5'><div class='block_title'><span class='ico'></span>高管曝光量</div><div class='block_content'><div class='ee_com'></div></div></div><div class='block_container md6'><div class='block_title'><span class='ico'></span>高管分工统计</div><div class='block_content'><div class='hm_com'></div></div></div></div>");

                    $(".content").append(companyHtml);
                }
            }
            initailSelector();
            initalWith();
        //}
        //else {
        //    alert("请选择对比对象")
        //}
        // $(".content").fadeIn(500);

    }

//为某个公司绑定数据
    function setCompanyData(comId) {

        var beData = getCompanyBiz(comId);

        $(".compare_company[comid='" + comId + "'] .be_com").pieChart({pData: beData});

        var hmData = getHightManagerSum(comId, 3);
        $(".compare_company[comid='" + comId + "'] .hm_com").barChart({
            category: hmData.category,
            pData: hmData.data
        });

        var bizProceeData = getBusinessActiveSum(comId);
        $(".compare_company[comid='" + comId + "'] .bp_com").barChart({
            category: bizProceeData.category,
            pData: bizProceeData.data
        });

        var ywHtml = "";
        //var ywHtml = "<thead><tr><td></td>";
        //
        //for(var i=0;i<bizProceeData.actives.length;i++){
        //    ywHtml+="<td>"+bizProceeData.actives[i]+"</td>";
        //}
        //ywHtml+="</tr></thead>";
        for (var i = 0; i < bizProceeData.category.length; i++) {
            ywHtml += "<tr><td>" + bizProceeData.category[i] + "</td>";
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

        var bizDisData = getBusinessDistribute(comId)
        var khHtml = "";
        for (var i = 0; i < bizDisData.length; i++) {
            khHtml += "<tr><td>" + bizDisData[i].bizName + "</td><td>" + bizDisData[i].distribute + "</td></tr>";
        }
        $(".compare_company[comid='" + comId + "'] .cus_com table tbody").html(khHtml);

        var actData = getCompanyActive(comId);
        $(".compare_company[comid='" + comId + "'] .m_com").columnChart({pData: actData});

        var highManagerData = getCompanyhighManger(comId);
        $(".compare_company[comid='" + comId + "'] .ee_com").pieChart({pData: highManagerData});

    }

    function initalWith() {
        var comCount = $(".compare_company").length;
        $(".content").width(comCount * 600);
    }

    function initalCompareData() {
        $(".compare_company").each(function () {
            var cid = $(this).attr("comid");
            setCompanyData(cid);
        });
    }

    $("#sel_trade").html(getHYHtml());
    //获取行业optionHtml
    function getHYHtml() {
        var selHtml = "";
        for (var i = 0; i < dataAll.length; i++) {
            selHtml += "<option value='" + dataAll[i].HYID + "'>" + dataAll[i].HYMC + "</option>";
        }
        return selHtml;
    }

    //获取公司optionHtml
    function getGSHtml(hyId) {
        var gsHtml = "";
        for (var i = 0; i < dataAll.length; i++) {
            if (dataAll[i].HYID == hyId) {
                for (var j = 0; j < dataAll[i].HYGS.length; j++) {
                    gsHtml += "<option value='" + dataAll[i].HYGS[j].GSID + "'>" + dataAll[i].HYGS[j].GSMC + "</option>";
                }
                break;
            }
        }
        return gsHtml;
    }

    //初始化行业和公司
    function initailSelector() {
        $(".sel_trade").html(getHYHtml());
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
        var comNewsData = getCompanyDataById(cid).GSXW;//要修改为动态
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
            var percent = tempObj[attr] / comNewsData.length;
            actData.push([attr, percent])
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
                    areaString += comNewsData[i].location + ",";
                }
            }
            areaString = areaString.substr(0, areaString.length - 1);
            var obj = {bizName: attr, distribute: areaString};
            returnData.push(obj);
        }
        return returnData;
    }

    //获取业务活动统计
    function getBusinessActiveSum(cid) {
        var returnData = {category: [], actives: [], data: []};//{category:[],data:[{name:'客户',data:[4,2,5,7]},{name:'客户',data:[4,,32,5]},{name:'客户',data:[4,2,2,5]}]};

        var comNewsData = getCompanyDataById(cid).GSXW;
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
    function getHightManagerSum(cid, topN) {
        var returnData = {category: [], actives: [], data: []};//{category:["人1","人2"],data:[{name:'客户',data:[4,2,5,7]},{name:'客户',data:[4,,32,5]},{name:'客户',data:[4,2,2,5]}]};

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
        return returnData;
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

    function BindAllData() {

            initalCompareHtml();
            initalCompareData();
            changeSelector();
            // $(".sel_trade").change();
            $("#btn_AddCom").text("+对比(" + compareArray.length + ")");

    }


})