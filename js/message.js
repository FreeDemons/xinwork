(function($, doc) {
	$.init({
		gestureConfig: {
			tap: true, //默认为true
			doubletap: true, //默认为false
			longtap: true, //默认为false
			swipe: true, //默认为true
			drag: true, //默认为true
			hold: true, //默认为false，不监听
			release: true //默认为false，不监听
		}
	});
	template.config('escape', false);

	$.plusReady(function() {
		var status;
		var pushMsgCount = 0;
		document.addEventListener('pause', function() {
			status = '后台';
		});
		document.addEventListener('resume', function() {
			status = '前台';
			if(plus.os.name == 'iOS'){
				status = '后台';//ios系统后台运行无法接收本地消息
			}
		})
		//在安卓机上点击信息进入页面
		if(mui.os.android){
			plus.push.addEventListener("click", function(msg) {
				// 分析msg.payload处理业务逻辑 
				plus.webview.getWebviewById('chat').show();
				pushMsgCount = 0;
			}, false);
		}
		
		
		importFace(); //表情功能
		LongForCopy(); //长按复制
		bindMsgList();

		//打开群成员页面
		$('.mui-pull-right').on('tap', '.icon-qunshezhi', function() {
				var groupPage = $.openWindow({
					id: 'group',
					url: "group.html",
					show: {
						duration: 200
					}
				});
				groupPage.addEventListener('loaded', function() {
					mui.fire(groupPage, 'room', {
						roomname: doc.querySelector('.mui-title').innerText,
						roomid: rid
					});
				})

			})
			//软键盘弹出处理
		plus.webview.currentWebview().setStyle({
			softinputMode: "adjustResize"
		});
		
		window.addEventListener('resize', function() {
			doc.querySelector('#msg-list').scrollTop = doc.querySelector('#msg-list').scrollHeight + doc.querySelector('#msg-list').offsetHeight;
		}, false);
		
		RongIMClient.setOnReceiveMessageListener({
			// 接收到的消息
			onReceived: function(message) {
				if (doc.querySelector('#msg-list').scrollHeight == doc.querySelector('#msg-list').scrollTop + doc.querySelector('#msg-list').offsetHeight) {
					setTimeout(function() {
						doc.querySelector('#msg-list').scrollTop = doc.querySelector('#msg-list').scrollHeight + doc.querySelector('#msg-list').offsetHeight;
					}, 100);
				}
				var targetId = message.targetId;
				var time;
				var content = message.content.content;
				var image_url = message.content.extra[1];
				var send_user_name = message.content.extra[0];
				var type = message.messageType;
				console.log(JSON.stringify(message));
				 unread[targetId] = (!isNaN(unread[targetId]) ? ++unread[targetId] :1) ;
				 console.log(unread[targetId]);
				plus.webview.getWebviewById('chat').evalJS("checkNewMsg(" + targetId + ","+ unread[targetId]+")");//刷新最新会话
				//后台运行推送消息叠加
				if(status == '后台') {
					pushMsgCount += 1;
				}

				if(!record[targetId]) {
					record[targetId] = [];
					lastIndex = 0;
				}
				else{
					lastIndex = record[targetId].length - 1;
				}				
				if(image_url == '/sites/default/files/avatar/default.jpg') {
					image_url = '../../images/default.jpg';
				}
				if(lastIndex < 1){
					 time = app.timestampToTime(message.sentTime);
				}else if(parseInt((message.sentTime - record[targetId][lastIndex].timestamp)/1000) < 180  ){
					time = '';
				}else{
					time = app.timestampToTime(message.sentTime);
				}
				var sendOut = function(content) {
						record[targetId].push({
							sender: '',
							sendername: send_user_name,
							senderImg: image_url,
							type: type,
							time: time,
							timestamp: message.sentTime,
							content: content
						});
						plus.storage.setItem(targetId,JSON.stringify(record[targetId]));
						bindMsgList();
					}
					// 判断消息类型
				switch(message.messageType) {
					case RongIMClient.MessageType.TextMessage:
						console.log('文字消息是    ' + JSON.stringify(message));

						var str = RongIMLib.RongIMEmoji.emojiToHTML(content);
						//print message
						sendOut(str);
						backstagePush(status, targetId, send_user_name, pushMsgCount, str);
						break;
					case RongIMClient.MessageType.VoiceMessage:
						// 对声音进行预加载
						// message.content.content 格式为 AMR 格式的 base64 码
						RongIMLib.RongIMVoice.preLoaded(content);
						console.log('收到的是' + content);
						dataURL2Audio(content,function(entry){
							console.log(entry.toURL());	
							sendOut(entry.toURL());
						})
						backstagePush(status, targetId, send_user_name, pushMsgCount, '[语音消息]');
						break;
					case RongIMClient.MessageType.ImageMessage:
						// do something...

						console.log('图片信息   ' + content);
						sendOut(content);
						backstagePush(status, targetId, send_user_name, pushMsgCount, '[图片消息]');
						break;
					case RongIMClient.MessageType.DiscussionNotificationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.LocationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.RichContentMessage:
						// do something...
						break;
					case RongIMClient.MessageType.DiscussionNotificationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.InformationNotificationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.ContactNotificationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.ProfileNotificationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.CommandNotificationMessage:
						// do something...
						break;
					case RongIMClient.MessageType.CommandMessage:
						// do something...
						break;
					case RongIMClient.MessageType.UnknownMessage:
						// do something...
						break;
					default:
						// 自定义消息
						// do something...
				}
			}
		});
		plus.webview.currentWebview().addEventListener('hide',function(){
			unread[rid] = 0;
			plus.webview.getWebviewById('chat').evalJS("checkNewMsg(" + rid + ","+ unread[rid]+")");//刷新最新会话
		})
	});
}(mui, document));