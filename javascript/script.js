console.log("Om Sai Ram")
let currentSong = new Audio();
console.log(currentSong.src)
let songs;
let currfolder;
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    // Pad single-digit seconds with a leading zero
    const paddedSecs = secs < 10 ? "0" + secs : secs;
    return `${mins}:${paddedSecs}`;
}
async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`http://192.168.1.6:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1]);
        }

    }

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
    
    
      <li>
                            <img class="invert"src="music.svg" alt="">
                            <div class="info">
                                <div class="songname">${song.replaceAll("%20", "  ")}</div>
                                <div class="artist">Arjit Sing</div>
                            </div>
                           <div class="playnow">
                             <span>Play Now</span>
                            <img src="play.svg" class="invert" alt="">
                           </div>
                        </li>
    
`
    }
    //attach an eventlistener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.replace(/\s+/g, ' '))
        })

    })
    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track
    // let audio= new Audio("/.vscode/Spotify Clone/songs/"+ track)
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}

async function displayAlbums() {
    let a = await fetch(`http://192.168.1.6:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let cardcontainer = document.querySelector(".cardcontainer")

    let anchors = div.getElementsByTagName("a")
    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            console.log(folder)
            //get the metadata of the folder
            let a = await fetch(`http://192.168.1.6:3000/songs/${folder}/info.json`)

            let response = await a.json();

            cardcontainer.innerHTML = cardcontainer.innerHTML + `
            
               <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">

                                <circle cx="50" cy="50" r="48" fill="#1fdf64" />

                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`

        }


    }
    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}/`);
            playMusic(songs[0], true) 
        })
    })
}
async function main() {

    // get the list of all the songs
    songs= await getsongs("songs/cs/")
    // console.log(songs)
    // play the first song

    //show the first song running first always
    playMusic(songs[0], true)

    // display all the albums on the page
    displayAlbums()

    let play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "play.svg"
        }
    })

    // add event listener for time
    currentSong.addEventListener("timeupdate", () => {
        const current = formatTime(currentSong.currentTime);
        const total = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${current} / ${total}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    });

    // add an event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration) * percent / 100;

    })








    //Add eventlistener for hamburger

    document.querySelector(".lines").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0%"
    });

    //Add eventlistener for close

    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-100%"
    });
    previous.addEventListener("click", () => {


        let index = songs.indexOf(currentSong.src.split("/songs/")[1])
        //  console.log(currentSong.src.split("/songs/")[1])
        // console.log(songs,index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            alert("No song Available");
        }
    })

    next.addEventListener("click", () => {

        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        //  console.log(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs,index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            alert("No song Available");
        }


        // add an event to volume


    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {

        currentSong.volume = (e.target.value / 100)
    })

    // Ad eventlistener for mute
    document.querySelector(".volume img").addEventListener("click", e => {

        console.log(e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }

    })

}

main()
