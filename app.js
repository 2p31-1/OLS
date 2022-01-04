const audioSelector = document.querySelector("#audio");
const musicPlayer = document.querySelector("#player");
const musicSyncer = document.querySelector("#lyricsSync");
const lyricsText = document.querySelector("#lyricsTextarea");
let lyricsArray = [];
let lyricsInfo = [];
let music;
let isControllable = true;
let selected = 0;
let synced = 0;

function refreshList(target) {
    if (lyricsArray[target][0] === null) {
        musicSyncer.children[target].innerText = lyric[1];
    } else {
        let s = parseInt(lyricsArray[target][0]);
        let m = parseInt(s / 60);
        s = s % 60;
        let p = parseInt((lyricsArray[target][0] % 1) * 1000);
        musicSyncer.children[target].innerText = "[" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "." +
            (p < 100 ? "0" : "") + (p < 10 ? "0" : "") + p + "]" + lyricsArray[target][1];
    }
}

function reWriteList() {
    musicSyncer.innerHTML = "";
    for (let i = 0; i < lyricsArray.length; i++) {
        let mark = document.createElement("li");
        if (lyricsArray[i][0] === null) {
            mark.appendChild(document.createTextNode(lyricsArray[i][1]));
        } else {
            let s = parseInt(lyricsArray[i][0]);
            let m = parseInt(s / 60);
            s = s % 60;
            let p = parseInt((lyricsArray[i][0] % 1) * 1000);
            mark.appendChild(document.createTextNode("[" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "." +
                (p < 100 ? "0" : "") + (p < 10 ? "0" : "") + p + "]" + lyricsArray[i][1]));
            mark.setAttribute("ondblclick", "changeTimeCursor(" + lyricsArray[i][0] + ")");
        }
        mark.setAttribute("onclick", "changeCursor(" + i + ")");
        musicSyncer.appendChild(mark);
    }
    changeCursor(0);
}

function doMark(target) { //Add a new time marker for lyrics
    lyricsArray[target][0] = musicPlayer.currentTime;
}

function toArray() { //LRC file to lyricsArray
    const regTimestamp = /\[(\d+):(\d+)\.(\d+)\]/;
    const regIDTag = /\[(.*):(.*)\]/;
    let textArray = lyricsText.value.split('\n');
    lyricsArray = [];
    lyricsInfo = [];

    for (let l = 0; l < textArray.length; l++) {
        let timestamp = textArray[l].match(regTimestamp);
        if (timestamp === null) {
            //not a lyrics or timestamp note tagged
            let info = textArray[l].match(regIDTag);
            if (info === null) {
                //a lyric without timestamp
                lyricsArray.push([null, textArray[l]]);
            } else {
                lyricsInfo.push([info[1], info[2]]);
            }
        } else {
            //is lyric
            let value = textArray[l].split(regTimestamp);
            let text = textArray[l].substr(timestamp[0].length);
            lyricsArray.push(
                [parseInt(value[1] * 60) + parseInt(value[2]) + parseFloat("0." + value[3]), text]
            );
        }
    }
    reWriteList();
}

function toText() {
    const textarea = lyricsText;
    textarea.value = "";
    for (let i = 0; i < lyricsInfo.length; i++) {
        textarea.value += ("[" + lyricsInfo[i][0] + ":" + lyricsInfo[i][1] + "]\n");
    }
    for (let i = 0; i < lyricsArray.length; i++) {
        if (lyricsArray[i][0] === null) {
            textarea.value += (lyricsArray[i][1] + "\n");
        } else {
            let s = parseInt(lyricsArray[i][0]);
            let m = parseInt(s / 60);
            s = s % 60;
            let p = parseInt((lyricsArray[i][0] % 1) * 1000);
            textarea.value += ("[" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "." +
                (p < 100 ? "0" : "") + (p < 10 ? "0" : "") + p + "]" + lyricsArray[i][1] + (i === lyricsArray.length - 1 ? "" : "\n"));
        }
    }
}

function closeLyricsWindow() {
    toArray();

}

function changeCursor(target) {
    if (target >= lyricsArray.length || target < 0) return;
    try {
        document.querySelector("#lyricsSync li:nth-child(" + (selected + 1) + ")").setAttribute("id", "");
    } catch { } //To prevent errors from removed previous selected list
    document.querySelector("#lyricsSync li:nth-child(" + (target + 1) + ")").setAttribute("id", "selected");
    selected = target;
}

function changeTimeCursor(second) {
    musicPlayer.currentTime = second;
}

audioSelector.addEventListener("change", (event) => { //Making uploaded music playable
    music = new Audio(URL.createObjectURL(event.target.files[0])).src;
    musicPlayer.src = music;
})

musicPlayer.addEventListener("timeupdate", (event) => { //Music synced lyrics
    let t = musicPlayer.currentTime;
    let n = null;
    let nt = null;
    for (let i = 0; i < lyricsArray.length; i++) {
        if (lyricsArray[i][0] < t) {
            //TODO: 여기서부터
        }
    }
    if (next !== null) changeSynced(next);
})

function changeSynced(target) {
    if (target >= lyricsArray.length || target < 0) return;
    try {
        document.querySelector("#lyricsSync li:nth-child(" + (synced + 1) + ")").setAttribute("class", "");
    } catch { } //To prevent errors from removed previous selected list
    document.querySelector("#lyricsSync li:nth-child(" + (target + 1) + ")").setAttribute("class", "synced");
    synced = target;
}

document.addEventListener("keydown", (event) => { //Keyboard event listener
    if (isControllable) {
        console.log(event.code);

        switch (event.code) {
            case "KeyS":
            case "Space": //adding time marker by pressing space
                doMark(selected);
                refreshList(selected);
                changeCursor(selected + 1);
                break;
            case "ArrowUp":
                changeCursor(selected - 1);
                break;
            case "ArrowDown":
                changeCursor(selected + 1);
                break;
            case "ArrowLeft":
                changeTimeCursor(musicPlayer.currentTime - 1);
                break;
            case "ArrowRight":
                changeTimeCursor(musicPlayer.currentTime + 1);
                break;
            case "KeyF":
                if (musicPlayer.paused) {
                    musicPlayer.play();
                } else {
                    musicPlayer.pause();
                }
        }
    }
});
