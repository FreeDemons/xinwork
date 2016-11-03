window.XW={
	env:"production",
	base:"http://120.24.36.146/xinworkapp/",
	//base:"http://192.168.0.101/goodjob58/xinworkapp/",
	xw:"http://xinwork.cn/",
	city:{96:'珠海',95:'中山',80:'佛山',83:'江门',79:'东莞',93:'湛江'},
	curCity:{'珠海':96,'中山':95,'佛山':80,'江门':83,'东莞':79,'湛江':93}
}

//沉浸式处理
var immersed = 0;
function adjustImmerse(){
		var topoffset = 44;
		var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
		if(ms && ms.length >= 3) { // 当前环境为沉浸式状态栏模式
			immersed = parseFloat(ms[2]); // 获取状态栏的高度
			topoffset = topoffset + immersed;
			var t = document.getElementsByTagName('header')[0];
			if(t) {
				t.style.paddingTop = immersed + 'px';
				t.style.height = topoffset + 'px';
			}
			var mc = document.getElementsByClassName('mui-content')[0];
			if(mc && t) {
				var newpt = 44 + immersed + 'px';
				mc.style.paddingTop = newpt;
			}
			//下拉刷新位置
			var mptp = document.getElementsByClassName('mui-pull-top-pocket')[0];
			if(mptp) {
				mptp.style.top = immersed + 'px';
			}
		}
	}

//添加下边线
function smallLine(){
	if(mui.os.ios){
		var eleArr = ["header",".mui-table-view","form"];
		for (var i=0;i<eleArr.length;i++) {
			var leg = document.querySelectorAll(eleArr[i]).length;
			if(leg>0){
				for (var j=0;j<leg;j++) {
					document.querySelectorAll(eleArr[i])[j].classList.add("lineclass-ios");
				}
			}
		}
	}
}

//插入loading动画
window.ownerLoad = {
	loading:document.createElement('div'),
	init:function(){
		this.loading.classList.add('loading');
		this.loading.innerHTML = '<div><span></span><span></span><span></span><span></span><span></span></div>';
		document.body.appendChild(this.loading);
	},
	show:function(){
		this.init();
		this.loading.style.display = 'block';
	},
	close:function(){
		this.loading.style.display = 'none';
	}
}



window.onload=function(){
	smallLine();
	adjustImmerse();
}