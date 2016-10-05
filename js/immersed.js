////沉浸式处理
//var immersed = 0;
//function adjustImmerse(){
//		var topoffset = 44;
//		var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
//		if(ms && ms.length >= 3) { // 当前环境为沉浸式状态栏模式
//			immersed = parseFloat(ms[2]); // 获取状态栏的高度
//			topoffset = topoffset + immersed;
//			var t = document.getElementsByTagName('header')[0];
//			if(t) {
//				t.style.paddingTop = immersed + 'px';
//				t.style.height = topoffset + 'px';
//			}
//			var mc = document.getElementsByClassName('mui-content')[0];
//			if(mc) {
//				var newpt = 44 + immersed + 'px';
//				mc.style.paddingTop = newpt;
//			}
//			//下拉刷新位置
//			var mptp = document.getElementsByClassName('mui-pull-top-pocket')[0];
//			if(mptp) {
//				mptp.style.top = immersed + 'px';
//			}
//		}
//	}
//
//window.onload=function(){
//	adjustImmerse();
//}