/**
 * Created by Guoliang on 2014/12/2.
 */
/// <reference path="jquery.js" />

(function ($) {
    $.fn.extend({
        pieChart: function (options) {
            var defVal = {
                pData: []
            };

            var opts = $.extend({}, defVal, options);
            $this = $(this);
            return $this.highcharts({
                chart: {
                    style: {
                        fontFamily: 'Microsoft YaHei'
                    }
                },
                colors:[
                    "#fffc9e",
                    "#d13a1f",
                    "#f472d0",
                    "#9b4f96",
                    "#0174bf",
                    "#6dc2e9",
                    "#00d8cc",
                    "#8ccf70",
                    "#e2e584",
                    "#fff100",
                    "#ff8c00",
                    "#d90000",
                    "#ec008c",
                    "#68217a",
                    "#00188f",
                    "#00b294",
                    "#009e49",
                    "#bad08a"
                ],
                title: { text: '' },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#555555',
                            connectorColor: '#555555',
                            format: '{point.name}: {point.percentage:.1f} %'
                        }
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: '占比',
                        data: opts.pData||[]
                    }
                ]
            })
        },
        barChart: function (options) {
            var defVal = {
                category:[],
                pData: []
            };
            var opts = $.extend({}, defVal, options);
            $this = $(this);
            var height=opts.category.length*opts.pData.length*opts.pData[0].data.length;
            return $this.highcharts({
                chart: {
                    type: 'bar',
                    height:height,
                    style: {
                        fontFamily: 'Microsoft YaHei'
                    }
                //height:opts.category.length*opts.pData[0].data.length*10
                },
                title: { text:null },
                subtitle: { text:null },
                xAxis: {
                    categories:opts.category,
                    title: {
                        text: null
                    },
                    labels:{
                        formatter:function(){
                         return this.value;
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: null,
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                //tooltip: { valueSuffix: ' millions' },
                plotOptions: {
                    bar: {
                        //stacking: 'normal',//同行显示
                        dataLabels: {
                            enabled: true,
                            formatter:function(){
                                if(this.y==0){
                                    return null;
                                }
                            else{
                                    return this.series.name+":"+this.y;
                                }
                            }
                        }
                    }
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    borderWidth:0,
                    backgroundColor: '#FFFFFF'
                },
                credits: {
                    enabled: false
                },
                series: opts.pData||[]
            })

        },
        columnChart:function(options){
            var defVal = {
                category:[],
                pData: []
            };
            var opts = $.extend({}, defVal, options);
            $this = $(this);
            return $this.highcharts({
                chart: {
                    type: 'column'
                },
                title: { text:null },
                subtitle: { text:null },
                xAxis: {
                    categories:opts.category,
                    title: {
                        text: null
                    }
                    //labels:{
                    //    formatter:function(){
                    //        return "百分之"+this.value;
                    //    }
                    //}
                },
                yAxis: {
                    title:{
                        text:null
                    },
                    gridLineWidth:0,
                    labels:{
                        enabled:false
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>'+ this.x +'</b><br/>'+
                            '占比: '+this.y +'%';
                    }
                },
                plotOptions: {
                    column:{
                        dataLabels:{
                            enabled:true,
                            formatter:function(){
                                return this.y+"%"
                            }
                        },
                        colorByPoint: true
                    }

                },
                colors: [
                   '#F46F5A','#7BCA90','#EBBD55'
                ],
                legend: {
                    enabled:false
                    //align: 'center',
                    //verticalAlign: 'bottom',
                    //borderWidth:0,
                    //backgroundColor: '#FFFFFF'
                },
                credits: {
                    enabled: false
                },
                series:[{data:opts.pData||[]}]
            })
        }
    })
})(jQuery);

