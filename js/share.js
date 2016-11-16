var shares = '';
//判断是否授权
function shareAction(s,msg) {
    console.log("分享操作：");
    if (!s) {
    	console.log('找不到share对象！');
        return;
    }
    if (s.authenticated) {
        shareMessage(s,msg);
    } else {
       console.log("---未授权---");
        s.authorize(function() {
        	console.log("进行授权");
            shareMessage(s,msg);
        }, function(e) {
            console.log("认证授权失败：" + e.code + " - " + e.message);
        });
    }
}
//分享操作
function shareMessage(s,msg){
    s.send( msg, function(){
        console.log( "分享到\""+s.description+"\"成功！ " );
    }, function(e){
        console.log( "分享到\""+s.description+"\"失败: "+e.code+" - "+e.message );
        mui.toast( "分享到\""+s.description+"\"失败");
    } );
}

/**
 * 更新分享服务
 */
function updateSerivces(){
	plus.share.getServices( function(s){
		shares={};
		for(var i in s){
			var t=s[i];
			shares[t.id]=t;
		}
	}, function(e){
		console.log( "获取分享服务列表失败："+e.message );
	} );
}

// 打开分享
function shareShow(sTitle,sContent,sHref){
	var shareItems = [];
	var pic = ["_www/images/logo.png"],thu = ["_www/images/thumbs.png"];
	updateSerivces();
	mui('body').on('tap', '.mui-popover-action .shareItem', function() {
	var ss = shares['weixin'];
	ss&&ss.nativeClient&&shareItems.push({content:sContent,href:sHref,title:sTitle,pictures:pic,thumbs:thu,extra:{scene:'WXSceneSession'}});
	ss&&ss.nativeClient&&shareItems.push({content:sContent,href:sHref,title:sTitle,pictures:pic,thumbs:thu,extra:{scene:'WXSceneTimeline'}});
	ss = shares['qq'];
	ss&&ss.nativeClient&&shareItems.push({content:sContent,href:sHref,title:sTitle,pictures:pic,thumbs:thu});
		mui('#shareJob').popover('toggle');
		if(shares['weixin'] && shares['qq']) {
						switch(this.id) {
							case 'weixin':
								shareAction(shares['weixin'],shareItems[0]);
								break;
							case 'pengyouquan':
								shareAction(shares['weixin'], shareItems[1]);
								break;
							case 'qq':
								shareAction(shares['qq'], shareItems[2])
								break;
						}
					} else {
						mui.toast('系统发生错误，无法分享。');
					}
	})
}
