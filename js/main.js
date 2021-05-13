'use strict';

const MAX_ADULT_STOCK = 1800,
    MAX_CHILD_STOCK = 200,
    FLY_TO_ZOOM = 19,
    INITIAL_ZOOM = 6,
    UPDATE_DELAY = 30000,
    SOURCE_URL = "https://data.nhi.gov.tw/resource/mask/maskdata.csv",
    SOURCE_FILE = "data/108_A1_A2_x_y.csv";

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
    map.setView([23.97565, 120.97388], INITIAL_ZOOM);
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
        }
    });


    console.log(accident_data[0].x, accident_data[0].y);
    for (var i = 0; i < accident_data.length - 1; i++) {
        if (accident_data[i].y == "" || accident_data[i].x == "") {
            continue;
        }
        var node = L.marker(new L.LatLng(accident_data[i].y, accident_data[i].x), { icon: currentIcon })
        node.bindPopup(
            `<p>死亡人數: ${accident_data[i].death_count}</p>
            <p>受傷人數: ${accident_data[i].hurt_count}</p>
            <p>時間: ${accident_data[i].datetime}</p>
            <p>當事人人數: ${accident_data[i].litigant}</p>
            <p>受傷程度: ${get_hurt_string(accident_data[i].injury_degree)}</p>
            <p>天氣: ${get_weather_string(accident_data[i].weather)}</p>
            <p>道路型態: ${get_load_type_string(accident_data[i].load_type)}</p>
            <p>道路型態: ${get_accident_location_type_string(accident_data[i].accident_location)}</p>
            `);
        markers.addLayer(node);
    }
    map.addLayer(markers);
    // var markers = L.markerClusterGroup({
    //     iconCreateFunction: function(cluster) {
    //         const number = cluster.getChildCount();
    //         return L.divIcon({
    //             html: number,
    //             className: 'icon-cluster sold-out',
    //             iconSize: L.point(25, 25)
    //         });
    //     }
    // });
    // arr.map(item => L.marker(new L.LatLng(item.Y, item.X), { icon: currentIcon })
    //         .bindPopup(`<p>經度: ${item.X}</p><p>緯度: ${item.Y}</p>`)) // 資訊視窗
    //     .forEach(item => markers.addLayer(item)); // 把marker加入 L.markerCluster
    // map.addLayer(markers);

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

function ori_coordData_load() {
    let map = L.map("app", { attributionControl: false, zoomControl: false, minZoom: 3, maxZoom: 19 });
    let osmUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let osm = new L.TileLayer(osmUrl, { minZoom: 3, maxZoom: 19 });
    let today = new Date();
    let currentIcon = L.icon({ iconUrl: "images/current.svg", className: "animation", iconSize: [24, 24] });
    let currentMar = L.marker([0, 0], { icon: currentIcon });
    let storeIcon = [
        L.icon({ iconUrl: "images/sold-out.svg", iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] }),
        L.icon({ iconUrl: "images/emergency.svg", iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] }),
        L.icon({ iconUrl: "images/warning.svg", iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] }),
        L.icon({ iconUrl: "images/sufficient.svg", iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] })
    ];
    let storeClass = ["sold-out", "emergency", "warning", "sufficient"];
    let xhr = new XMLHttpRequest();
    let markerCluster = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
            let list = cluster.getAllChildMarkers(),
                order = 0;
            for (let i = 0; i < list.length; i++) {
                order = order < 3 && list[i].options.icon.options.iconUrl === storeIcon[3].options.iconUrl ? 3 :
                    order < 2 && list[i].options.icon.options.iconUrl === storeIcon[2].options.iconUrl ? 2 :
                    order < 1 && list[i].options.icon.options.iconUrl === storeIcon[1].options.iconUrl ? 1 : order;
            }
            return L.divIcon({ className: "icon-cluster " + storeClass[order], iconSize: [72, 30] });
        },
        removeOutsideVisibleBounds: true,
        animate: true,
        maxClusterRadius: 40
    });

    let childrenStat = false;
    let locationPermit = false;
    let geoCollection = JSON.parse(this.responseText);

    map.addLayer(osm);
    map.setView([23.97565, 120.97388], INITIAL_ZOOM);
    map.setMaxBounds([
        [90, -180],
        [-90, 180]
    ]);
    document.getElementById("zoom-in").addEventListener("click", () => { map.zoomIn() });
    document.getElementById("zoom-out").addEventListener("click", () => { map.zoomOut() });
    document.getElementById("current-location").addEventListener("click", function() {
        if (locationPermit) {
            map.flyTo(currentMar.getLatLng(), 18);
        }
        if (navigator.geolocation) {
            let pos = navigator.geolocation.watchPosition(function(geo) {
                currentMar.setLatLng([geo.coords.latitude, geo.coords.longitude]);
                currentMar.bindPopup("<p class='user-location'>目前位置</p><p class='loc-accuracy'>GPS 精確度：" + Math.round(geo.coords.accuracy * 100) / 100 + " 公尺</p>");
                currentMar.addTo(map);
                markerCluster.eachLayer(function(layer) {
                    layer.getPopup().getContent().getElementsByClassName("store-distance")[0].innerText = geoDistance([
                        [geo.coords.latitude, geo.coords.longitude],
                        [layer.getPopup().getContent().dataset.lat, layer.getPopup().getContent().dataset.lng]
                    ]);
                });
                document.getElementById("app").classList.add("allow-location");
                locationPermit = true;
            }, function() {
                alert("定位資料取得失敗，故不能進行目前位置顯示");
                document.getElementById("app").classList.remove("allow-location");
                locationPermit = false;
                currentMar.remove();
            }, { enableHighAccuracy: true });
        }
    });

    document.getElementById("menu").addEventListener("click", click_menu);
    document.getElementById("app").addEventListener("click", click_app);
    document.getElementById("help").addEventListener("click", click_help);

    xhr.addEventListener("load", function() {
        let temp = ori_csvParse(this.responseText);
        for (let i in geoCollection.features) {
            let id = geoCollection.features[i].properties.id;
            if (temp[id] == null) continue;
            geoCollection.features[i].properties = temp[id];
        }
        let markers = L.geoJSON(geoCollection, {
            pointToLayer: function(store, storeLocation) {
                let marker = L.marker(storeLocation, { icon: storeIcon[markerOrder("adult", store.properties.mask_adult)] }),
                    popupConfig = { maxWidth: "auto" },
                    popupContent = L.DomUtil.create("div", "store-information"),
                    storeStatus = L.DomUtil.create("div", "store-status", popupContent);
                popupContent.dataset.lat = storeLocation.lat;
                popupContent.dataset.lng = storeLocation.lng;
                popupContent.dataset.id = store.properties.id;
                for (let i = 0; i < 2; i++) {
                    let container = L.DomUtil.create("div", "container", storeStatus),
                        label = L.DomUtil.create("p", "label", container),
                        numContainer = L.DomUtil.create("p", "number-container", container);
                    switch (i) {
                        case 0:
                            label.innerText = "成人口罩數量";
                            container.classList.add(storeClass[markerOrder("adult", store.properties.mask_adult)]);
                            numContainer.innerHTML = "<span class='number'>" + store.properties.mask_adult + "</span> 片";
                            break;
                        case 1:
                            label.innerText = "兒童口罩數量";
                            container.classList.add(storeClass[markerOrder("child", store.properties.mask_child)]);
                            numContainer.innerHTML = "<span class='number'>" + store.properties.mask_child + "</span> 片";
                            break;
                    }
                }
                let storeName = L.DomUtil.create("p", "store-name", popupContent),
                    storeAddr = L.DomUtil.create("p", "store-address detail", popupContent),
                    storePhon = L.DomUtil.create("p", "store-phone detail", popupContent),
                    storeUpda = L.DomUtil.create("p", "store-updated detail", popupContent);
                storeName.innerHTML = store.properties.name + "<span class='store-distance'></span>";
                storeAddr.innerHTML = "<span class='icon fas fa-map-marked-alt'></span><span class='text'><a href='https://www.google.com/maps?q=" + store.properties.name + "+" + store.properties.address + "' target='_blank'>" + store.properties.address + "</a></span>";
                storePhon.innerHTML = "<span class='icon fas fa-phone'></span><span class='text'><a href='tel:" + store.properties.phone + "'>" + store.properties.phone + "</a></span>";
                storeUpda.innerHTML = "<span class='icon fas fa-sync-alt'></span><span class='text'>" + store.properties.updated + "</span>";
                marker.bindPopup(popupContent, popupConfig).on("click", function() {
                    location.hash = this.getPopup().getContent().dataset.id;
                });
                if (store.properties.name)
                    return marker;
            }
        });
        markerCluster.addLayer(markers);
        map.addLayer(markerCluster);

        if (location.hash != "") {
            markerCluster.eachLayer(function(layer) {
                let markerData = layer.getPopup().getContent().dataset;
                if (markerData.id == location.hash.substr(1)) {
                    map.setView([markerData.lat, markerData.lng], FLY_TO_ZOOM);
                    layer.openPopup();
                    return this;
                }
            });
        }
    });
    xhr.open("GET", SOURCE_URL + "?time=" + new Date().getTime());
    xhr.send();
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

function geoDistance(arr) {
    for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++)
            arr[i][j] = arr[i][j] / 180 * Math.PI;
    let EARTH_RADIUS = 6371000,
        d = 2 * EARTH_RADIUS * Math.asin(Math.sqrt(Math.pow(Math.sin((arr[1][0] - arr[0][0]) / 2), 2) + Math.cos(arr[0][0]) * Math.cos(arr[1][0]) * Math.pow(Math.sin((arr[1][1] - arr[0][1]) / 2), 2)));

    d = d > 1000 ? (d / 1000).toFixed(2) + "km" : d.toFixed(2) + "m";
    return d;
}

function ori_csvParse(str) {
    let data = str.split(/\r?\n/),
        temp = new Object;
    data.shift();
    for (let i in data) {
        let rawdata = data[i].split(",");
        temp[rawdata[0]] = new Object;
        temp[rawdata[0]]["id"] = rawdata[0];
        temp[rawdata[0]]["name"] = rawdata[1];
        temp[rawdata[0]]["address"] = rawdata[2];
        temp[rawdata[0]]["phone"] = rawdata[3];
        temp[rawdata[0]]["mask_adult"] = rawdata[4];
        temp[rawdata[0]]["mask_child"] = rawdata[5];
        temp[rawdata[0]]["updated"] = rawdata[6];
    }
    return temp;
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
        // let item = new Object;
        // temp[rawdata[0]] = new object;
        // temp[rawdata[0]]["datetime"] = rawdata[0];
        // temp[rawdata[0]]["process_code"] = rawdata[1];
        // temp[rawdata[0]]["location"] = rawdata[2];
        // temp[rawdata[0]]["place"] = rawdata[3];
        // temp[rawdata[0]]["death_count"] = rawdata[4];
        // temp[rawdata[0]]["hurt_count"] = rawdata[5];
        // temp[rawdata[0]]["litigant"] = rawdata[6];
        // temp[rawdata[0]]["injury_degree"] = rawdata[7];
        // temp[rawdata[0]]["weather"] = rawdata[8];
        // temp[rawdata[0]]["rate_limit"] = rawdata[9];
        // temp[rawdata[0]]["load_type"] = rawdata[10];
        // temp[rawdata[0]]["accident_location"] = rawdata[11];
        // temp[rawdata[0]]["X"] = rawdata[12];
        // temp[rawdata[0]]["Y"] = rawdata[13];
    }
    console.log(temp[0]);
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