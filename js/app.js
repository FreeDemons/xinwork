(function($, owner) {

//监控网络状态
owner.checkNetwork = function() {
	var network = plus.networkinfo.getCurrentType();
	if(network < 2) {
		var btnArray=["我再看看","设置网络"];
		mui.confirm('小主的网络似乎在偷懒', '联网异常', btnArray, function(e) {
			if (e.index == 1) {
				if(mui.os.android){
					var main = plus.android.runtimeMainActivity();
					var Intent = plus.android.importClass("android.content.Intent");
					var mIntent = new Intent('android.settings.WIFI_SETTINGS');
					main.startActivity(mIntent);
				}else if(mui.os.ios){
					plus.runtime.openURL("prefs:root=WIFI"); //打开wifi设置页面
				}
			} else {
				mui.toast("小主的网络状态不好什么都做不了哦");
			}
		});
	}else{
		return true;
	}
}
//设置当前用户
owner.setUser = function() {
	mui.ajax(XW.base + 'customize/user',{
		type: "get",
		contentType:"application/json",
		dataType:'JSON',
		success: function (data) {
			if(data == ""){
				plus.storage.removeItem('user');
			}else{
				plus.storage.setItem('user',data);
			}
		},
		error: function(msg,e){
			plus.storage.removeItem('user');
		}
	});
};

//手机号码处理
owner.interceptionStr=function(str){
	return str.substring(0,3)+" **** "+str.substring(7);
}

//银行卡支付宝账号处理
owner.interceptionStr1=function(str){
	var str = str.replace(/\s/g, "");
	var star = " ";
	for(var i=0;i<(str.length-7);i++){
		star += '*';
	}
	return str.substring(0,3)+star +" "+str.substring(str.length-4);
}

//银行卡号格式转换
owner.bankFormat=function(number){
	var val=number.replace(/[ ]/g,"");
	var arr=val.split("");
	for(var i=3;i<arr.length;i+=4){
		if(i != (arr.length-1)){arr[i]+=" ";}
	}
	return arr.join("");
}

//通过操作表添加照片
owner.addPicture=function(s){
	var btnArray = [{title:"打开相机"},{title:"手机相册"}];
	plus.nativeUI.actionSheet( {
		cancel:"取消",
		buttons:btnArray
	}, function(e){
		if(e.index == 1){app.addCameraPicture(s)}
		else if(e.index == 2){app.addGalleryPicture(s)}
	});
}

//通过拍照添加照片
owner.addCameraPicture=function(s){
	var cmr=plus.camera.getCamera();
	cmr.captureImage(function(p){
		plus.io.resolveLocalFileSystemURL(p,function(entry){
			app.picUpload(entry.toLocalURL(),s);
		},function(e){
			mui.alert("读取拍照文件错误："+e.message);
		});
	},function(e){});
}

//通过相册添加照片
owner.addGalleryPicture=function(s){
	plus.gallery.pick(function(path){
		app.picUpload(path,s);
  }, function() {},{filter: "image",multiple: false});
}

//上传图片
owner.picUpload=function(lacalpath,s){
	var user=JSON.parse(plus.storage.getItem('user'));
	var filepath;
	switch (s){
		case "userphoto":
			filepath = "public://user_photo/";
			break;
		case "identity":
			filepath = "public://identity/";
			break;
		case "avatar":
			filepath = "public://avatar/";
			break;
		case "task":
			filepath = "public://task/";
			break;
		default:
			break;
	}
	
	var img = new Image();
    img.src = lacalpath; // 传过来的图片
    //图片处理
    img.onload = function() {
        //生成比例
        var w = this.width,h = this.height,scale = w / h;
        w = 1024 || w; //480 你想压缩到多大
        h = w / scale;
        //生成canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width=w;
        canvas.height=h;
        
        ctx.drawImage(this, 0, 0, w, h);
        var base64 = canvas.toDataURL('image/jpeg', 0.5); //1z 表示图片质量，越低越模糊。
        var timestamp = (Date.parse(new Date()))/1000;

        //ajax上传到服务器
        var filedata = {
        	"file":base64.split(",")[1],
        	"filepath":filepath+user.uid + "-" + timestamp +".jpg",
        	"filename":user.uid+ "-" + timestamp +".jpg",
        	"type":"image"
        };
		var login_session=JSON.parse(plus.storage.getItem('login_session'));
		plus.nativeUI.showWaiting( "正在上传..." );
		mui.ajax(XW.base + "file",{
			headers:{
				'X-CSRF-token':login_session.token,
				'Cookie':login_session.session_name+'='+login_session.sessid
			},
			data: JSON.stringify({"file":filedata}),
			type: "POST",
			//contentType: false,
			//processData: false,
			contentType:"application/json",
			dataType:'JSON',
			success: function (data) {
				plus.nativeUI.closeWaiting();
				photoCallback(data,lacalpath);
			},
			error: function(msg,e){
				plus.nativeUI.closeWaiting();
				mui.alert("上传失败","温馨提示");
			}
		});
    }
}

//下载在线升级包wgt文件
owner.downWgt = function(wgtUrl){
    plus.nativeUI.showWaiting("稍等，马上就好...");//不要提示下载
    plus.downloader.createDownload( wgtUrl, {filename:"_doc/update/"}, function(d,status){
        if ( status == 200 ) {
            app.installWgt(d.filename); // 安装wgt包
        } else {
            plus.nativeUI.alert("更新失败！");
        }
        plus.nativeUI.closeWaiting();
    }).start();
}

//更新应用资源包
 owner.installWgt = function(path){
    plus.nativeUI.showWaiting("安装更新文件...");
    plus.runtime.install(path,{},function(){
	        plus.nativeUI.closeWaiting();
	        plus.nativeUI.alert("应用资源更新完成！",function(){
	        plus.runtime.restart();
        });
    },function(e){
        plus.nativeUI.closeWaiting();
        plus.nativeUI.alert("安装更新文件失败");
    });
}
 
 //监测更新
owner.checkUpdate = function(){
	//先获取本地版本号
	plus.runtime.getProperty(plus.runtime.appid,function(inf){
		var currentVersionStr = inf.version;
		var currentVersion = currentVersionStr.split('.');
		//先判断整包下载，再判断资源升级
		mui.getJSON(XW.base + 'appversion/0',function(data){
			//field_remark是版本号，body是升级备注
			var apkVersion = data[0].field_remark.split('.');
			if(currentVersion[0] == apkVersion[0] && currentVersion[1] == apkVersion[1]){
				mui.getJSON(XW.base + 'appversion/1',function(datas){
					if(currentVersionStr != datas[0].field_remark){
						app.downWgt(datas[0].field_version_file);
					}
				});
			}else{
				var btnArray = ['立即更新', '以后更新'];
				mui.confirm(data[0].body, '新版本更新', btnArray, function(e) {
					//点击不更新，不需要做任何提示
					if (e.index == 0) {
						if(mui.os.android){
							app.downWgt(data[0].field_version_file);
						}else{
							plus.runtime.openURL("itms-apps://itunes.apple.com/cn/app/xin-wo-jian-zhi/id1148908099?mt=8")
						}
					}
				})
			}
		});
   });
}
//时间戳转时分,参数为十三位时间戳
owner.timestampToTime = function(timestamp) {
				var t = new Date(timestamp);
				var hours = t.getHours(),
					minutes = t.getMinutes();
				if(hours < 10) {
					hours = '0' + t.getHours();
				}
				if(minutes < 10) {
					minutes = '0' + t.getMinutes();
				}
				return hours + ':' + minutes;
		}

//联网下载图片
owner.setImgFromNet = function(loadUrl,callback){
	var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
    var relativePath = "_downloads/" + filename;
     plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
                    console.log("图片存在,直接设置=" + relativePath);
                    //如果文件存在,则直接设置本地图片
                }, function(e) {
                    console.log("图片不存在,联网下载=" + relativePath);
                    //如果文件不存在,联网下载图片
			        //创建下载任务
			        var dtask = plus.downloader.createDownload(loadUrl, {}, function(d, status) {
			            if (status == 200) {
			                //下载成功
			                console.log("下载成功=" + relativePath);
			                callback(d);
			            } else {
			                //下载失败,需删除本地临时文件,否则下次进来时会检查到图片已存在
			                console.log("下载失败=" + status+"=="+relativePath);
			                //dtask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);
			                if (relativePath!=null)
			                    app.delFile(relativePath);
			            }
			        });
			        //启动下载任务
			        dtask.start();
                });
}


 /*删除指定文件*/
owner.delFile = function (relativePath) {
    plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
        entry.remove(function(entry) {
            console.log("文件删除成功==" + relativePath);
        }, function(e) {
            console.log("文件删除失败=" + relativePath);
        });
    });
}
}(mui, window.app = {}));

