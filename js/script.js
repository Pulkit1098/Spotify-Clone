// Declaring global variables
let currentsong = new Audio(); // Audio object for playing the current song
let isFetched = false; // Boolean to track if songs have been fetched
let songs; // Array to store the list of songs
let currFolder; // Current folder being accessed for songs

// Function to format the time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Ensuring integer seconds
    
    // Ensure two digits for minutes and seconds
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from a given folder
async function getSongs(folder){
    currFolder = folder; // Set the current folder
    let a = await fetch(`https://raw.githubusercontent.com/Pulkit1098/Spotify-Clone/main/${currFolder}/`) // Fetch the folder's content
    let response = await a.text(); // Get the response as text
    let div = document.createElement("div")
    div.innerHTML = response; // Parse the response as HTML
    let as = div.getElementsByTagName("a") // Get all anchor elements (links)
    songs = [] // Initialize an empty array for songs
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) { // Check if the link is an mp3 file
            songs.push(element.href.split(`/${currFolder}/`)[1]) // Add the song to the list
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0] // Get the song list container
    songUL.innerHTML = ""; // Clear any existing songs in the list
    for (const song of songs) {
        // Add each song to the list dynamically
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="image/music.svg" alt="">
        <div class="info">
        <div>${song ? decodeURIComponent(song) : ''}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="image/playButton.svg" alt="">
        </div>
        </li>`;
    }

    // Add event listeners for each song to start playing when clicked
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playmusic(e.querySelector(".info").firstElementChild.innerHTML) // Play the selected song
        })
    })

    return songs // Return the array of songs
}

// Function to play the selected music
const playmusic = (track, pause=false)=>{
    // currentsong.src = `http://127.0.0.1:3000/${currFolder}/` + track; // Set the source of the song
    currentsong.src = `https://raw.githubusercontent.com/Pulkit1098/Spotify-Clone/main/${currFolder}/${track}`;

    if(!pause){
        currentsong.play() // Play the song if not paused
        play.src = "image/pause.svg" // Change play button to pause icon
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track) // Display the song title
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00" // Reset the song time
}

// Function to dynamically display albums from the server
async function displayAlbums(){
    let a = await fetch(`https://raw.githubusercontent.com/Pulkit1098/Spotify-Clone/main/songs/`) // Fetch the songs directory
    let response = await a.text(); // Get the response as text
    let div = document.createElement("div")
    div.innerHTML = response; // Parse the response as HTML
    let anchors = div.getElementsByTagName("a") // Get all anchor elements (links)
    let cardcontainer = document.querySelector(".card-container") // Get the card container to display albums
    let array = Array.from(anchors) // Convert the NodeList to an array
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) { // Filter folders containing songs
            let folder = e.href.split("/").slice(-2)[0] // Get the folder name
            let a = await fetch(`https://raw.githubusercontent.com/Pulkit1098/Spotify-Clone/main/songs/${folder}/info.json`) // Fetch the album metadata
            let response = await a.json(); // Parse the metadata as JSON
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
              <img src="image/hoverbutton.svg" alt="Hover to play">
            </div>
            <img src="https://raw.githubusercontent.com/Pulkit1098/Spotify-Clone/main/songs/${folder}/cover.jpeg" alt="Album cover"/>
            <h3>${response.title}</h3>
            <p>${response.description}</p>
          </div>` // Add the album card to the page
        }
     }
     
     // Add event listeners to each album card to fetch and play songs from the selected album
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${(item.currentTarget.dataset.folder)}`) // Fetch songs from the selected album
            playmusic(songs[0]) // Play the first song
        })
    })
}

// Main function to initialize the music player
async function main(){
    await getSongs("songs/bgm") // Load background music
    playmusic(songs[0], true) // Play the first song in background music

    displayAlbums(); // Display the albums dynamically
    
    // Play/Pause button functionality
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play() // Play the song if paused
            play.src = "image/pause.svg" // Change button to pause
        }
        else{
            currentsong.pause() // Pause the song if playing
            play.src = "image/playButton.svg" // Change button to play
        }
    })
    
    // Update the song's time as it plays
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%"; // Update progress bar
    })

    // Seekbar functionality to jump to a specific time in the song
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = precent + "%";
        currentsong.currentTime = ((currentsong.duration)*precent)/100; // Set the new song time
    })

    // Hamburger menu functionality for opening the side menu
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0" // Slide in the menu
    })
    
    // Close button functionality for closing the side menu
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%" // Slide out the menu
    })

    // Previous song functionality
    previous.addEventListener("click", ()=>{
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1) [0]) // Get the current song's index
        if((index-1) >= 0){
            playmusic(songs[index-1]) // Play the previous song
        }
    })
    
    // Next song functionality
    next.addEventListener("click", ()=>{
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1) [0]) // Get the current song's index
        if((index+1) < songs.length){
            playmusic(songs[index+1]) // Play the next song
        }
    })

    // Adjust volume functionality
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentsong.volume = parseInt(e.target.value)/100 // Set the volume based on the range input
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg") // Show volume icon
        }
    })

    // Mute/Unmute functionality
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg") // Switch to mute icon
            currentsong.volume = 0; // Mute the song
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0 // Set volume slider to 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg") // Switch to volume icon
            currentsong.volume = .50; // Set volume to 50%
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50 // Set volume slider to 50%
        }
    })
}

// Call the main function to initialize the app
main();
