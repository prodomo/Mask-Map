'use strict';

const MAX_ADULT_STOCK = 1800,
    MAX_CHILD_STOCK = 200,
    FLY_TO_ZOOM = 19,
    INITIAL_ZOOM = 10,
    UPDATE_DELAY = 30000,
    SOURCE_URL = "https://data.nhi.gov.tw/resource/mask/maskdata.csv",
    SOURCE_FILE = "data/108_A1_A2_x_y.csv";
    // SOURCE_FILE = "data/test.csv";
    ALERT_COUNT = 5

require(["pace.min", "leaflet"], function() {
    require(["leaflet.markercluster"], function() {
        let coordData = new XMLHttpRequest();
        coordData.addEventListener("load", map_test);
        coordData.open("GET", SOURCE_FILE);
        coordData.send();
    });
});


function map_test() {
    let accident_data = csvParse(this.responseText);
    console.log(accident_data.length);

    let map = L.map("app", { attributionControl: false, zoomControl: false, minZoom: 3, maxZoom: 19 });
    let osmUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 19 });
    let today = new Date();
    let currentIcon = L.icon({ iconUrl: "images/current.svg", className: "animation", iconSize: [24, 24] });
    let currentMar = L.marker([0, 0], { icon: currentIcon });
    map.addLayer(osm);
    map.setView([24.97565, 121.47388], INITIAL_ZOOM);
    map.setMaxBounds([
        [90, -180],
        [-90, 180]
    ]);
    
    var markers = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
            const number = cluster.getChildCount();
            let icon = IconLogic(number);
            return L.divIcon({
                html: number,
                className: icon.className,
                iconSize: icon.point
            });
        },
        animate: true,
        maxClusterRadius: 40
    });

    let childrenStat = false;
    let locationPermit = false;
    var curr_latitude = 0;
    var curr_longitude = 0;

    /* add accident nodes to the map*/
    var nodes = get_nodes(accident_data, curr_latitude, curr_longitude);
    markers.addLayer(nodes[0]);
    map.addLayer(markers);

    document.getElementById("zoom-in").addEventListener("click", () => { map.zoomIn() });
    document.getElementById("zoom-out").addEventListener("click", () => { map.zoomOut() })

    /* add current location node to the map*/
    document.getElementById("current-location").addEventListener("click", function() {
        if (locationPermit) {
            map.flyTo(currentMar.getLatLng(), 18);
        }
        if (navigator.geolocation) {
            let pos = navigator.geolocation.watchPosition(function(geo) {
                currentMar.setLatLng([geo.coords.latitude, geo.coords.longitude]);
                currentMar.bindPopup("<p class='user-location'>目前位置</p><p class='loc-accuracy'>GPS 精確度：" + Math.round(geo.coords.accuracy * 100) / 100 + " 公尺</p>");
                currentMar.addTo(map);
                curr_latitude = geo.coords.latitude;
                curr_longitude = geo.coords.longitude;
                document.getElementById("app").classList.add("allow-location");
                locationPermit = true;
            }, function() {
                alert("定位資料取得失敗，故不能進行目前位置顯示");
                document.getElementById("app").classList.remove("allow-location");
                locationPermit = false;
                currentMar.remove();
            }, { enableHighAccuracy: true });
        }
        markers.clearLayers();
        var new_nodes = get_nodes(accident_data, curr_latitude, curr_longitude);
        markers.addLayer(new_nodes[0]);
        markers.refreshClusters();
        if(new_nodes[1] >= ALERT_COUNT) {
            setTimeout(function() { alert("鄰近事故熱點，請多加留意"); }, 5000);
        }
    });
    
    document.getElementById("menu").addEventListener("click", click_menu);
    document.getElementById("app").addEventListener("click", click_app);
    document.getElementById("help").addEventListener("click", click_help);
}

function get_nodes(accident_data, curr_latitude, curr_longitude)
{
    var node_array = [];
    var close_count = 0;
    for (var i = 0; i < accident_data.length - 1; i++) {
        var distance = 0;
        if (accident_data[i].y == "" || accident_data[i].x == "") {
            continue;
        }
        if(curr_latitude != 0 && curr_longitude != 0){
            distance = get_distance_to_location(curr_latitude, curr_longitude, accident_data[i]);
            if(distance > 0 && distance < 0.5) {
                close_count+=1;
            }
        }
        var node = L.marker(new L.LatLng(accident_data[i].y, accident_data[i].x), { icon: MarkerLogic(accident_data[i].death_count) })
        node.bindPopup(
            `<p>死亡人數: ${accident_data[i].death_count}</p>
            <p>受傷人數: ${accident_data[i].hurt_count}</p>
            <p>時間: ${accident_data[i].datetime}</p>
            <p>當事人人數: ${accident_data[i].litigant}</p>
            <p>受傷程度: ${get_hurt_string(accident_data[i].injury_degree)}</p>
            <p>天氣: ${get_weather_string(accident_data[i].weather)}</p>
            <p>道路型態: ${get_load_type_string(accident_data[i].load_type)}</p>
            <p>道路型態: ${get_accident_location_type_string(accident_data[i].accident_location)}</p>
            <p>距離: ${distance} km</p>
            `);
        node_array.push(node);
    }
    var nodes = L.layerGroup(node_array);
    return [nodes, close_count];
}

function get_distance_to_location(curr_latitude, curr_longitude, accident_data)
{
    if(curr_latitude !=0 && curr_longitude != 0) {
        let test = distance(curr_latitude, curr_longitude, accident_data.y, accident_data.x);
        return test
    }else{
        return -1;
    }
}

function get_accident_location_type_string(accident_location) {
    switch (accident_location) {
        case "1":
            return "交叉口內";
        case "2":
            return "交叉口附近";
        case "3":
            return "機車待轉區";
        case "4":
            return "機車停等區";
        case "5":
            return "交通島";
        case "6":
            return "迴轉道";
        case "7":
            return "快車道";
        case "8":
            return "慢車道"
        case "9":
            return "一般車道(未劃分快慢車道)";
        case "10":
            return "公車專用道";
        case "11":
            return "機車專用道";
        case "12":
            return "機車優先道";
        case "13":
            return "路肩、路緣";
        case "14":
            return "加速車道";
        case "15":
            return "減速車道";
        case "16":
            return "直線匝道";
        case "17":
            return "環道匝道";
        case "18":
            return "行人穿越道";
        case "19":
            return "穿越道附近";
        case "20":
            return "人行道";
        case "21":
            return "收費站附近";
        case "22":
            return "其他";
        default:
            return "";
    }
}

function get_load_type_string(load_type) {
    switch (load_type) {
        case "1":
            return "平交道(有遮斷器)";
        case "2":
            return "平交道(無遮斷器)";
        case "3":
            return "三岔路";
        case "4":
            return "四岔路";
        case "5":
            return "多岔路";
        case "6":
            return "隧道";
        case "7":
            return "地下道";
        case "8":
            return "橋梁"
        case "9":
            return "涵洞";
        case "10":
            return "高架道路";
        case "11":
            return "彎曲路及附近";
        case "12":
            return "坡路";
        case "13":
            return "巷弄";
        case "14":
            return "直路";
        case "15":
            return "其他";
        case "16":
            return "圓環";
        case "17":
            return "廣場";
        default:
            return "";
    }
}

function get_hurt_string(injury_degree) {
    switch (injury_degree) {
        case "1":
            return "24小時死亡";
        case "2":
            return "受傷";
        case "3":
            return "未受傷";
        case "4":
            return "不明";
        case "5":
            return "2-30日內死亡";
        default:
            return "";
    }
}

function get_weather_string(weather) {
    switch (weather) {
        case "1":
            return "暴雨";
        case "2":
            return "強風";
        case "3":
            return "風沙";
        case "4":
            return "霧或煙";
        case "5":
            return "雪";
        case "6":
            return "雨";
        case "7":
            return "陰";
        case "8":
            return "晴";
        default:
            return "";
    }
}

function create_icon(cluster) {
    const number = cluster.getChildCount();
    let icon = IconLogic(number);

    return L.divIcon({ html: number, className: icon.className, iconSize: icon.point });
}

function IconLogic(number) { // 數量
    let storeClass = ["sold-out", "emergency", "warning", "sufficient"];
    let className = "";
    let point;

    if (number < 100) {
        className += "icon-cluster " + storeClass[0];
        point = L.point(25, 25);
    } else if (number < 200) {
        className += "icon-cluster " + storeClass[1];
        point = L.point(30, 30);
    } else if (number < 300) {
        className += "icon-cluster " + storeClass[2];
        point = L.point(35, 35);
    } else {
        className += "icon-cluster " + storeClass[3];
        point = L.point(40, 40);
    }

    return {
        className: className,
        point: point
    }
}

function MarkerLogic(death_count) {
    var int_death_count = parseInt(death_count, 10);
    if(int_death_count > 0) {
        return L.icon({ iconUrl: "images/emergency.svg", iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] });
    }else{
        return L.icon({ iconUrl: "images/warning.svg", iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] });
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function CreatePoint(count) {　　 // count為產生的點數量
    let arr = [];
    for (let i = 0; i < count; i++) {
        let longitude = random(120.5, 121.4); // 經度介於120.5~121.4
        let latitude = random(23, 24.6); // 緯度介於23~24.6

        arr.push({ x: longitude, y: latitude });
    }
    return arr;
}

function markerOrder(str, num) {
    let rate;
    switch (str) {
        case "adult":
            rate = num / MAX_ADULT_STOCK;
            return rate >= 0.5 ? 3 : rate >= 0.2 ? 2 : rate > 0 ? 1 : 0;
        case "child":
            rate = num / MAX_CHILD_STOCK;
            return rate >= 0.5 ? 3 : rate >= 0.2 ? 2 : rate > 0 ? 1 : 0;
    }
}

function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		dist = dist * 1.609344;
		return dist.toFixed(3);
	}
}

function csvParse(str) {
    let data = str.split(/\r?\n/),
        temp = new Array;
    data.shift();
    let counter = 0;
    for (let i in data) {
        let rawdata = data[i].split(",");
        let item = new Object;
        item["datetime"] = rawdata[0];
        item["process_code"] = rawdata[1];
        item["location"] = rawdata[2];
        item["place"] = rawdata[3];
        item["death_count"] = rawdata[4];
        item["hurt_count"] = rawdata[5];
        item["litigant"] = rawdata[6];
        item["injury_degree"] = rawdata[7];
        item["weather"] = rawdata[8];
        item["rate_limit"] = rawdata[9];
        item["load_type"] = rawdata[10];
        item["accident_location"] = rawdata[11];
        item["x"] = rawdata[12];
        item["y"] = rawdata[13];
        temp.push(item);
        counter += 1;
    }
    return temp;
}

function click_help() {
    document.getElementById("guide").classList.toggle('open');
}

function click_menu() {
    document.getElementById("information").classList.toggle('close');
    this.classList.toggle("close");
}

function click_app() {
    if (document.documentElement.clientWidth <= 768 && !document.getElementById("information").classList.contains("close")) {
        document.getElementById("information").classList.add("close");
        document.getElementById("menu").classList.add("close");
    }
}