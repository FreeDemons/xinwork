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
    } );
}

/**
 * 更新分享服务
 */
function updateSerivces(){
	plus.share.getServices( function(s){
		share={};
		for(var i in s){
			var t=s[i];
			share[t.id]=t;
		}
	}, function(e){
		console.log( "获取分享服务列表失败："+e.message );
	} );
}