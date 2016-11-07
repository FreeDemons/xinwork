//send message
function sendMessage(e, name, image, groupId) {
	var extra = new Array();
	extra[0] = name;
	extra[1] = image;
	// 定义消息类型,文字消息使用 RongIMLib.TextMessage
	var targetId = groupId; // 目标 Id

	//var str = RongIMLib.RongIMEmoji.symbolToEmoji(e); //表情名称转emoji

	if(e.substring(0, 10) == 'data:image') {

		var msg = new RongIMLib.ImageMessage({
			content: e,
			extra: extra
		});
	}else if(e.substring(0, 10) == 'data:audio') {
		var msg = new RongIMLib.VoiceMessage({
			content: e,
			extra: extra
		});
	}else {
		var msg = new RongIMLib.TextMessage({
			content: e,
			extra: extra
		});
	}
	var conversationtype = RongIMLib.ConversationType.GROUP; //群聊
	RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
		// 发送消息成功
		onSuccess: function(message) {
			//message 为发送的消息对象并且包含服务器返回的消息;唯一Id和发送消息时间戳
			//处理返回的数据
			var data = new Date(message.sentTime);
			var time = data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds();
			var content = message.content.content;
			var contentTxt = RongIMLib.RongIMEmoji.emojiToHTML(content);
			var image_url = message.content.extra[1];
			var send_user_name = message.content.extra[0];
			var sid = message.senderUserId;
			var tid = message.targetId;
			var mtype = message.messageType;
			var ctype = message.conversationType;
			plus.webview.getWebviewById('chat').evalJS("checkNewMsg(" + rid + ","+ '0' +")");//刷新最新会话
			switch(message.messageType) {
				case RongIMClient.MessageType.TextMessage:
					//保存消息到服务器
					var url = XW.base+'rongcloud/history/save';
					var content = RongIMLib.RongIMEmoji.emojiToSymbol(message.content.content);
					mui.ajax(url, {
						type: 'post',
						data: {
							sendId: message.senderUserId,
							targetId: message.targetId,
							sendTime: message.sentTime,
							messageType: message.messageType,
							conversationType: message.conversationType,
							sendContent: contentTxt
						},
						dataType:'json',
						success: function(e) {
							console.log("文字上传成功！"+tid);
//							console.log(e);
						},
						error: function(x, t, e) {
						console.log(t+'  '+x.status);
					}
					});
					break;
				case RongIMClient.MessageType.ImageMessage:
					// do something...
					var url = XW.base+'rongcloud/history/save';
					mui.ajax(url, {
						type: 'post',
						data: {
							base64: e,
							fileName: '555.jpg',
							targetId: message.targetId,
							conversationType: message.conversationType,
							messageType: message.messageType,
							sendId:message.senderUserId
						},
						dataType:'json',
						success: function() {
							console.log("图片上传成功！");
						}
					});
					break;
				case RongIMClient.MessageType.VoiceMessage:
					// do something...
					console.log("发送语音成功");
					var url = XW.base+'rongcloud/history/save';
					mui.ajax(url, {
						type: 'post',
						data: {
							base64: e,
							fileName: '',
							targetId: message.targetId,
							conversationType: message.conversationType,
							messageType: message.messageType,
							sendId:message.senderUserId
						},
						dataType:'json',
						success: function(result) {
						}
					});
			}

		},
		onError: function(errorCode, message) {
			var info = '';
			message.isSended = false;
			switch(errorCode) {
				case RongIMLib.ErrorCode.TIMEOUT:
					info = '超时';
					break;
				case RongIMLib.ErrorCode.UNKNOWN_ERROR:
					info = '未知错误';
					break;
				case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
					info = '在黑名单中，无法向对方发送消息';
					break;
				case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
					info = '不在讨论组中';
					break;
				case RongIMLib.ErrorCode.NOT_IN_GROUP:
					info = '不在群组中';
					break;
				case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
					info = '不在聊天室中';
					break;
				default:
					info = x;
					break;
			}
			console.log('发送失败:' + info + name + image + groupId);
		}
	});
}



