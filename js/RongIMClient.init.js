
//初始化融云
RongIMClient.init('4z3hlwrv3v23t');
RongIMLib.RongIMVoice.init();
RongIMClient.setConnectionStatusListener({
	onChanged: function(status) {
		switch(status) {
			//链接成功
			case RongIMLib.ConnectionStatus.CONNECTED:
				console.log('链接成功');
				break;
				//正在链接
			case RongIMLib.ConnectionStatus.CONNECTING:
				console.log('正在链接');
				break;
				//重新链接
			case RongIMLib.ConnectionStatus.DISCONNECTED:
				console.log('断开连接');
				plus.webview.getWebviewById('chat').evalJS("showError('请检查网络设置')");
				break;
				//其他设备登录
			case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
				console.log('其他设备登录');
				plus.webview.getWebviewById('chat').evalJS("showError('其他设备登录')");
				break;
				//网络不可用
			case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
				console.log('网络不可用');
				plus.webview.getWebviewById('chat').evalJS("showError('请检查网络设置')");
				break;
		}
	}
});

mui.plusReady(function() {
	t=plus.storage.getItem('mToken');
	mui.getJSON(XW.base+'rongcloud/getToken', function(data) {
		console.log(JSON.stringify(data)+'      '+data.token);
		RongIMClient.connect(data.token, {
			onSuccess: function() {
				console.log("Login successfully!");
		
			},
			onTokenIncorrect: function() {
				console.log('token无效');
			},
			onError: function(errorCode) {
				var info = '';
				switch(errorCode) {
					case RongIMLib.ErrorCode.TIMEOUT:
						info = '超时';
						break;
					case RongIMLib.ErrorCode.UNKNOWN_ERROR:
						info = '未知错误';
						break;
					case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
						info = '不可接受的协议版本';
						break;
					case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
						info = 'appkey不正确';
						break;
					case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
						info = '服务器不可用';
						break;
				}
				console.log(errorCode);
			}
		});
	});
})