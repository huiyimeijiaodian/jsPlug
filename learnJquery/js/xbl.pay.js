//支付插件
    ;(function($, window, document,undefined){
        function payMask(opt){
            this.defaults={
                curTitle: '小伴龙学堂',
                price: 0,
                payPrice: 0,
                paytype: 'wx',
                isWx: true,
                ApplePay: true,
                isSales: 0,//是否有奖学金
                saleInfo: {},//奖学金
                coins: 0,
                curDevice: 0,
                urltag:'',
                Turl: 'index?index=0&',
                TiaoUrl: '',
                bagId: '',
                version:720,
            };
            this.opt = $.extend({}, this.defaults, opt)
            this.init(this.opt);
            this.bindEven();
        }
        payMask.prototype={
            init:function(opt){
                $(".Maskbg").detach();
                var PayHtml = '<div class="Maskbg">';
                PayHtml += '<div class="MaskMain">';
                PayHtml += '<div class="MaskTitle">';
                PayHtml += '<h3>' +  opt.curTitle + '</h3>';
                PayHtml += '<span class="CloseMask"><a href="javascript:;"></a></span>';
                PayHtml += '</div>';
                PayHtml += '<div class="MaskPayInfo"><span>' + ( opt.payPrice/100) + '元</span>需付款</div>';
                PayHtml += '<div class="MaskPaylist">';
                PayHtml += '<ul>';
                if ( opt.curDevice) {
                    if ( opt.ApplePay) {
                        PayHtml += '<li class="current" data-pay="wx"><i class="pwxicon"></i>微信支付</li>';
                        PayHtml += '<li data-pay="qr"><i class="pqricon"></i>扫码支付</li>';
                        PayHtml += '<li data-pay="lb"><i class="plbicon"></i>龙币支付(余额' +  opt.coins + '元)</li>';
                    } else {
                        PayHtml += '<li class="current" data-pay="lb"><i class="plbicon"></i>龙币支付(余额' +  opt.coins + '元)</li>';
                    }
                } else {
                    if (opt.channelPay == 'huawei') {
                        PayHtml += '<li class="current" data-pay="hwp"><i class="phwicon"></i>华为支付(支持微信)</li>';
                        if( opt.maxhwpay) {
                            PayHtml += '<li data-pay="qr"><i class="pqricon"></i>扫码支付</li>';
                        }
                    } else if (opt.channelPay == 'oppo') {
                        PayHtml += '<li class="current" data-pay="oppo"><i class="oppoicon"></i>oppo支付(支持微信)</li>';
                        PayHtml += '<li data-pay="qr"><i class="pqricon"></i>扫码支付</li>';
                    } else {
                        PayHtml += '<li class="current" data-pay="wx"><i class="pwxicon"></i>微信支付</li>';
                        PayHtml += '<li data-pay="qr"><i class="pqricon"></i>扫码支付</li>';
                    }
                    if ( opt.coins > 0 && opt.version > 720) {
                        PayHtml += '<li data-pay="lb"><i class="plbicon"></i>龙币支付(余额' +  opt.coins + '元)</li>';
                    }
                }
                PayHtml += '</ul>';
                PayHtml += '</div>';
                if( opt.isSales > 0 && opt.saleInfo.salePrice){
                    PayHtml +='<div class="sales"><span>-' +  opt.saleInfo.salePrice + '</span>奖学金优惠<em>(有效期至' +  opt.saleInfo.endTime + ')</em></div>';
                }
                PayHtml += '<div class="MaskPayBtn">';
                if (( opt.curDevice == 1 &&  opt.ApplePay == 0) &&  opt.coins <  opt.payPrice) {
                    PayHtml += '<a href="javascript:;" class="payTips">龙币余额不足，立即充值</a>';
                } else {
                    PayHtml += '<a href="javascript:;" class="payTips">确认支付 ' +  (opt.payPrice/100) + '元</a>';
                }
                PayHtml += '</div></div></div>';
                $("body").append(PayHtml);
            },
            //显示支付弹窗
            show:function(opt){
                var _this=this;
                $.extend(this.opt,opt);
                console.log('show2',opt,this.opt);
                this.init(opt);
                $(".Maskbg").animate({bottom:"0%"});
                $(".MaskPaylist > ul > li").eq(0).trigger('touchstart')//触发接触事件
            },
            //隐藏支付弹窗
            hide:function(){
                $(".Maskbg").animate({
                    bottom: "-120%"
                });
            },
            bindEven:function(){
                var _this=this;
                var canClick = true;
                //选择支付方式
                $('body').on('touchstart','.MaskPaylist > ul > li',function(){
                    //在ios的body绑定click事件无效
                    // console.log('click li');
                    var opt=_this.opt;
                    $(this).addClass('current').siblings().removeClass('current');
                    if ($(this).attr('data-pay') == "lb" &&  opt.coins <  opt.payPrice/100) {
                        $(".payTips").text("龙币余额不足");
                    } else {
                        $(".payTips").text("确认支付 " +  opt.payPrice/100 + "元");
                    }
                    resetTiaourl($(this).attr('data-pay'),opt);
                });
                //去支付
                $('body').on('touchstart','.payTips',function(){
                    var opt=_this.opt;
                    console.log('去支付',opt);
                    if (canClick) {
                        canClick = false;
                        setTimeout(function() {
                            canClick = true;
                        }, 2000);
                        if ( opt.paytype == 'wx' &&  opt.isWx == 0) {
                            ATIPS("手机未安装微信，请使用扫码支付");
                        } else {
                            if ( opt.paytype == 'lb' &&  opt.coins >=  opt.payPrice/100) {
                                console.log("龙币支付");
                                longbicion(opt);
                                $(".Maskbg").animate({
                                    bottom: "-120%"
                                });
                            } else if (! opt.curDevice &&  opt.paytype == 'lb' &&  opt.coins <  opt.payPrice/100) {
                                ATIPS("龙币余额不足,请使用其它支付方式");
                            } else {
                                window.location.href =  _this.opt.TiaoUrl;
                                $(".Maskbg").animate({
                                    bottom: "-120%"
                                });
                            }
                        }
                    }
                });
                //关闭支付弹窗
                $('body').on('click','.CloseMask',function(e){
                    _this.hide();
                });
            }
        }
        //重置支付链接
        function resetTiaourl(payType,opt) {
            console.log('reset',payType,opt);
            var payMap={
                'wx':'xbl_pay_bdata',
                'qr':'pay_qrcode',
                'lb':'pay_recharge',
                'hwp':'xbl_huawei_bdata',
                'oppo':'xbl_oppo_bdata'
            }
            var  payText=payMap[payType]?payMap[payType]:'pay_recharge';
            opt.TiaoUrl=opt.Turl + payText+'=' +  opt.bagId + "&urltag=" +  opt.urltag + "&title=" +  opt.curTitle;
            opt.paytype=payType;
        }
        //ajax龙币支付
        function longbicion(opt) {
            $.ajax({
                type: 'POST',
                url: '/coins/exchange/school.json',
                data: "bdata=" + opt.bagId + "&urltag=" + opt.urltag,
                dataType: "json",
                success: function(msg) {
                    if (msg.rc == 0) {
                        ATIPS("购买成功，正在发包中");
                        setTimeout(function() {
                            window.location.href = opt.Turl + "&coin_pay_result=1";
                        }, 1000);
                    } else {
                        alert(msg.msg);
                    }
                }
            });
        }
        //提示
        function ATIPS(a) {
            var text = a!= ''?a:'正在发起支付';
            $('body').append('<div class="Azhe"></div><div class="Aertips">' + text + '</div>');
            setTimeout(function() {
                $(".Aertips").detach();
                $(".Azhe").detach();
            }, 2000);
        }

        //导出payMask
        window.payMask = payMask;
    }(jQuery, window, document));