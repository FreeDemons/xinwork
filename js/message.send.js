(function($, doc) {
	var MIN_SOUND_TIME = 800;
	$.plusReady(function() {
		var ui = {
			body: doc.querySelector('body'),
			footer: doc.querySelector('footer'),
			footerRight: doc.querySelector('.footer-right'),
			footerLeft: doc.querySelector('.footer-left'),
			footerCenRight: doc.querySelector('.footer-cenRight'),
			btnMsgType: doc.querySelector('#msg-type'),
			boxMsgText: doc.querySelector('#msg-text'),
			boxMsgSound: doc.querySelector('#msg-sound'),
			btnMsgImage: doc.querySelector('#msg-image'),
			areaMsgList: doc.querySelector('#msg-list'),
			faceBox: doc.querySelector('.faceBox'),
			boxSoundAlert: doc.querySelector('#sound-alert'),
			h: doc.querySelector('#h'),
			content: doc.querySelector('.mui-content')
		};


		//将信息插入数组
		var send = function(rid, msg) {
			if(!record[rid]) {
				lastIndex = 0;
			} else {
				lastIndex = record[rid].length - 1;
			}
				console.log(lastIndex);
			msg.timestamp = new Date().getTime();
			if(lastIndex <=0) {
				curTime = app.timestampToTime(msg.timestamp);
			} else if(parseInt((msg.timestamp - record[rid][lastIndex].timestamp) / 1000) < 180) {
				curTime = '';
			} else {
				curTime = app.timestampToTime(msg.timestamp);
			}
			msg.time = curTime;
			record[rid].push(msg);
			plus.storage.setItem(rid, JSON.stringify(record[rid]));
			bindMsgList();
			ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight ;
		};
		var tapCount = 0;
		if(plus.storage.getItem('user')) {
			var uid = JSON.parse(plus.storage.getItem('user')).uid;
		}
		//监听fire事件
		window.addEventListener('roomName', function(event) {
			
			//消息停留在页面底部
			setTimeout(function() {
				ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
			}, 10);
			
				tapCount++;
				if(rid != event.detail.roomid) {
					ui.areaMsgList.innerHTML = '';
					tapCount = 1;
				}
				var rname = event.detail.roomname;
				rid = event.detail.roomid;
				doc.querySelector('.mui-title').innerText = rname;
				if(!record[rid]) record[rid] = [];
				controlStorage(rid,30);//控制本地缓存信息数量
				if(tapCount == 1) {

					record[rid] = JSON.parse(plus.storage.getItem(rid));
					if(record[rid] == null) {
						record[rid] = [message('xw','薪窝小助手','../../images/default.jpg','','TextMessage','','',false,true,'小主好，薪窝小助手欢迎您进群！')];
					} 
					bindMsgList();
				}
				if (plus.storage.getItem('msgUser') == null ) {
					//从缓存块读取当前用户以检索查询用户的接口中的头像信息
					matchMsgUser(rid,uid,function(data){
						console.log('当前用户的头像  '+data.imgUrc);
						app.setImgFromNet(data.imgUrc,function(entry){
							data.imgUrlocal =  plus.io.convertLocalFileSystemURL(entry.filename);
							msgUser = data;
							plus.storage.setItem('msgUser', JSON.stringify(msgUser));
						})
					})
				}else{
					msgUser = JSON.parse(plus.storage.getItem('msgUser'));
				}
			})
			//发送文字信息
		ui.footerRight.addEventListener('release', function(event) {
			var name = msgUser.userName;
			var imgurl = msgUser.imgUrc;
			var content = ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '<br/>');
			var gid = rid;
			var saveUrl = XW.base + 'rongcloud/history/save/' + gid;
			var sended = (app.checkNetwork() == true ? true : false);
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				msgTextFocus();
				send(rid, message('self', name, imgurl,msgUser.imgUrlocal,'TextMessage', curTime, timestamp, false, sended, content));
				sendMessage(content, name, imgurl, gid, saveUrl);
				ui.boxMsgText.value = '';
				$.trigger(ui.boxMsgText, 'input', null);
			} else if(ui.btnMsgType.classList.contains('icon-yuyin')) {
				ui.btnMsgType.classList.add('icon-23');
				ui.btnMsgType.classList.remove('icon-yuyin');
				ui.boxMsgText.style.display = 'none';
				ui.boxMsgSound.style.display = 'block';
				ui.footerCenRight.style.display = 'none';
				ui.boxMsgText.blur();
				document.body.focus();
			} else if(ui.btnMsgType.classList.contains('icon-23')) {
				ui.btnMsgType.classList.add('icon-yuyin');
				ui.btnMsgType.classList.remove('icon-23');
				ui.boxMsgSound.style.display = 'none';
				ui.boxMsgText.style.display = 'block';
				ui.footerCenRight.style.display = 'block';
			}
		}, false);
		//发送图片
		ui.footerLeft.addEventListener('tap', function(event) {
			var name = msgUser.userName;
			var imgurl = msgUser.imgUrc;
			var gid = rid;
			var saveUrl = XW.base + 'rongcloud/history/save/' + gid;
			var sended = (app.checkNetwork() == true ? true : false);

			var btnArray = [{
				title: "拍照"
			}, {
				title: "从相册选择"
			}];
			plus.nativeUI.actionSheet({
				title: "选择照片",
				cancel: "取消",
				buttons: btnArray
			}, function(e) {
				var index = e.index;
				switch(index) {
					case 0:
						break;
					case 1:
						var cmr = plus.camera.getCamera();
						cmr.captureImage(function(path) {
							send(rid, message('self', name, imgurl,msgUser.imgUrlocal, 'ImageMessage', curTime, timestamp, false, sended, "file://" + plus.io.convertLocalFileSystemURL(path)));

							getBase64(plus.io.convertLocalFileSystemURL(path), name, imgurl, gid, saveUrl);
						}, function(err) {});
						break;
					case 2:
						plus.gallery.pick(function(path) {
							send(rid, message('self', name, imgurl,msgUser.imgUrlocal, 'ImageMessage', curTime, timestamp, false, sended, path));

							getBase64(path, name, imgurl, gid, saveUrl);
						}, function(err) {}, null);
						break;
				}
			});
		}, false);
		var recordCancel = false;
		var recorder = null;
		var audio_tips = document.getElementById("audio_tips");
		var startTimestamp = null;
		var stopTimestamp = null;
		var stopTimer = null;
		//按住录制语音
		ui.boxMsgSound.addEventListener('hold', function(event) {
			var name = msgUser.userName;
			var imgurl = msgUser.imgUrc;
			var gid = rid;
			var saveUrl = XW.base + 'rongcloud/history/save/' + gid;
			var sended = (app.checkNetwork() == true ? true : false);

			recordCancel = false;
			if(stopTimer) clearTimeout(stopTimer);
			audio_tips.innerHTML = "手指上划，取消发送";
			ui.boxSoundAlert.classList.remove('rprogress-sigh');
			setSoundAlertVisable(true);
			recorder = plus.audio.getRecorder();
			if(recorder == null) {
				plus.nativeUI.toast("不能获取录音对象");
				return;
			}
			startTimestamp = (new Date()).getTime();
			recorder.record({
				filename: "_doc/audio/",
				format: 'amr'
			}, function(path) {
				if(recordCancel) return;
				send(rid, message('self', name, imgurl,msgUser.imgUrlocal, 'VoiceMessage', curTime, timestamp, false, sended, path));
				console.log("声音路径为" + path);
				//转码且发送
				audioBase64(path, name, imgurl, gid, saveUrl);
			}, function(e) {
				plus.nativeUI.toast("录音时出现异常: " + e.message);
			});
		}, false);
		//上滑取消发送语音
		ui.body.addEventListener('drag', function(event) {
			if(Math.abs(event.detail.deltaY) > 50) {
				if(!recordCancel) {
					recordCancel = true;
					if(!audio_tips.classList.contains("cancel")) {
						audio_tips.classList.add("cancel");
					}
					audio_tips.innerHTML = "松开手指，取消发送";
				}
			} else {
				if(recordCancel) {
					recordCancel = false;
					if(audio_tips.classList.contains("cancel")) {
						audio_tips.classList.remove("cancel");
					}
					audio_tips.innerHTML = "手指上划，取消发送";
				}
			}
		}, false);
		//松开按钮录制语音
		ui.boxMsgSound.addEventListener('release', function(event) {
			if(audio_tips.classList.contains("cancel")) {
				audio_tips.classList.remove("cancel");
				audio_tips.innerHTML = "手指上划，取消发送";
			}
			//
			stopTimestamp = (new Date()).getTime();
			if(stopTimestamp - startTimestamp < MIN_SOUND_TIME) {
				audio_tips.innerHTML = "录音时间太短";
				ui.boxSoundAlert.classList.add('rprogress-sigh');
				recordCancel = true;
				stopTimer = setTimeout(function() {
					setSoundAlertVisable(false);
				}, 800);
			} else {
				setSoundAlertVisable(false);
			}
			recorder.stop();
		}, false);
		ui.boxMsgSound.addEventListener("touchstart", function(e) {
			//console.log("start....");
			e.preventDefault();
		});

		//footer样式及交互
		//表情框的弹出
		ui.footerCenRight.addEventListener('tap', function() {
			ui.footer.classList.toggle('riseFooter');
			ui.faceBox.classList.toggle('fall');
			ui.areaMsgList.classList.add('msglist_heigth_66');
			ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight ;
			
		})

		//键入输入框改变样式
		ui.boxMsgText.addEventListener('input', function(event) {
			ui.btnMsgType.classList[ui.boxMsgText.value == '' ? 'remove' : 'add']('mui-icon-paperplane');
			ui.btnMsgType.setAttribute("for", ui.boxMsgText.value == '' ? '' : 'msg-text');
			ui.h.innerText = ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '\n-') || '-';
			ui.footer.style.height = (ui.h.offsetHeight + footerPadding) + 'px';
			ui.content.style.paddingBottom = ui.footer.style.height;
		});
		var focus = false;
		ui.boxMsgText.addEventListener('tap', function(event) {
			ui.boxMsgText.focus();
			setTimeout(function() {
				ui.boxMsgText.focus();
			}, 0);
			focus = true;
			setTimeout(function() {
				focus = false;
			}, 1000);
			event.detail.gesture.preventDefault();
		}, false);

		ui.boxMsgText.addEventListener('focus', function() {
				ui.footer.classList.remove('riseFooter');
				ui.faceBox.classList.add('fall');
				ui.areaMsgList.classList.remove('msglist_heigth_66');
				
			})
		
		doc.querySelector('.footer-right').addEventListener('tap',function(){
			ui.faceBox.classList.add('fall');
			ui.footer.classList.remove('riseFooter');
		})

		
			//点击消息列表，关闭键盘  
		ui.areaMsgList.addEventListener('click', function(event) {
				if(!focus) {
					ui.boxMsgText.blur();
					ui.footer.classList.remove('riseFooter');
					ui.faceBox.classList.add('fall');
					ui.areaMsgList.classList.remove('msglist_heigth_66');
				}
			})
			//对话框及聊天款样式变化
		ui.h.style.width = ui.boxMsgText.offsetWidth + 'px';
		var footerPadding = ui.footer.offsetHeight - ui.boxMsgText.offsetHeight;

	});

}(mui, document));