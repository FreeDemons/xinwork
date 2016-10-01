window.XW={
	env:"production",
	base:"http://120.24.36.146/xinworkapp/",
	xw:"http://xinwork.cn/",
	city:{96:'珠海',95:'中山',80:'佛山',83:'江门',79:'东莞',93:'湛江'},
	curCity:{'珠海':96,'中山':95,'佛山':80,'江门':83,'东莞':79,'湛江':93}
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
window.onload=function(){
	smallLine();
}