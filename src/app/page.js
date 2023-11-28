'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';

import axios from 'axios';

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = "https://kqavzuydlsgzmrixmoxm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYXZ6dXlkbHNnem1yaXhtb3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwODAyNzMsImV4cCI6MjAxNTY1NjI3M30.-RjsZdFxzaPLceW5jfUpGsDqfUN8r0ApBR1lbiXrMY4"
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {

  const [isSigned, setIsSigned] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [songs, setSongs] = useState(null);
  const [artists, setArtists] = useState(null);
  const [url, setURL] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error
    }) => {
      // console.log(data?.session.access_token);
      if(data?.session?.access_token)
      {
        getSpotifyUserInfo();

        if(data?.session?.provider_token === null)
        {
          signInWithSpotify();
        }

        setAccess(data?.session?.provider_token);
      } else {
        setIsSigned(false);
      }
    })

    const subscription = supabase.auth.onAuthStateChange((event => {
      if (event === "SIGNED_OUT") {
        setIsSigned(false);
      }
      return subscription.data.subscription.unsubscribe();
    }))

  })

  function truncateText(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }
  

  async function getSpotifyUserInfo() {
    const { data: { user } } = await supabase.auth.getUser()

    setSpotifyUser(user);
    setIsSigned(true);

  }

  async function signInWithSpotify() {

    const { outError } = await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-top-read'
      }
    })
    getSpotifyUserInfo();

    setAccess(data.session.provider_token);

  }

  async function getTopSongs() {

    setIsGenerating(true);

    //Need to put all of this server side so I dont get fucked by a $5000 bill from OpenAI

    const accessToken = access; // Replace with the actual Spotify access token

    console.log(access);

    const serverUrl = "http://localhost:8082/api/images/trackGenerate";

    const config2 = {
      headers: {
        'provider': `Bearer ${accessToken}`,
        'authorization': `Bearer ${accessToken};`
      }
    }

    axios.get(serverUrl, config2)
     .then(response => {
      console.log("worked", response.data);
      setArtists(response.data.artists);
      setSongs(response.data.songs);
      setURL(response.data.image_response[0].url);
     })
     .catch(error => {
      console.log("there was an error")
      console.error("Error", error);
     });
  }

  function WrappedAIContent({url, isGenerating, songs, artists, spotifyUser})
  {

    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = async () => {
      try {
        const canvas = await html2canvas(document.getElementById('wrapped-content'));
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'wrappedAIContent.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloaded(true);
      } catch (error) {
        console.error('Error capturing screenshot:', error);
      }
    };


    if(url)
    {
      return (
        <div className='bg-black w-full h-[100vh] flex flex-col items-center justify-center'>
          <div id = "wrapped-content" className='border-[#1ED760] border w-[360px] h-[640px] bg-black md:mt-0 mt-2'>
            <div className='w-full h-[33.33px] ml-2 items-center flex'>
              <text className='font-thin text-sm text-white'>www.wrapped</text>
              <text className='font-thin text-sm text-[#1ED760]'>ai</text>
              <text className='font-thin text-sm text-white'>.lol</text>
            </div>
            <div className = "w-full bg-black h-[360px] items-center justify-center flex">
              <Image src = {url} alt = "AI Generated Image" width={"360"} height={"360"}/>
            </div>
            <div className='w-full h-[200px]'>
              <div className='flex flex-row w-full'>
                <text className='font-semibold text-md ml-2'>{truncateText(spotifyUser.user_metadata.full_name)}</text>
                <text className='font-semibold text-md'>&apos;s 2023 Top Songs</text>
              </div>
              <div className='ml-2 flex flex-col'>
                {songs.map((song, index) => (
                  <div className='flex flex-row' key={index}>
                    <text className='font-light text-white'>{truncateText(song, 20)}</text>
                    <text className='font-light ml-1 text-white'>by</text>
                    <text className='font-bold text-[#1ED760] ml-1'>{truncateText(artists[index], 20)}</text>
                  </div>
                ))}
              </div>
              <div className='flex md:mt-12 mt-8 justify-end'>
                <div className='w-[70%] items-end flex'>
                  <text className='ml-2 font-light text-white'>built by @siddharth_balaji</text>
                </div>
                <div className='flex flex-col items-end mr-1'>
                  <text className='font-light text-white'>Generated by</text>
                  <div className='ml-2'>
                    <text className='font-semibold text-white'>Wrapped</text>
                    <text className='font-semibold text-[#1ED760]'>AI</text>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="bg-[#1ED760] rounded-full w-40 h-16 flex items-center justify-center mt-8 mr-4 border-[#1ED760] border-2 hover:bg-[#F4F4FF] flex-col">
            <text className="text-black font-light">Regenerate</text>
            <text className='text-black font-light text-xs'>3 left</text>
          </button>
          <button
            onClick={handleDownload}
            disabled = {downloaded}
            className = "bg-[#1ED760] rounded-full w-40 h-16 flex items-center justify-center mt-10 mr-4 border-[#1ED760] border-2 hover:bg-[#F4F4FF]"
          >
            <text className="text-black font-light">{downloaded ? 'Downloaded' : 'Download'}</text>
          </button>
        </div>
      )
    } else {
      return (
        <div className='bg-black w-full h-[90%] mt-[25%] flex flex-col items-center justify-center'>
          <text className='text-[#1ed760] font-light text-lg'>generating your custom image...</text>
        </div>
      )
    }
  }
  


  return (
    <body className = "h-screen w-full flex items-center justify-center bg-black">
      <div className = "flex flex-col h-full w-full bg-black">
        <div className = "flex flex-row justify-end h-auto bg-black">

        {!isSigned ? 
          <>
            <button
              className="bg-[#1ED760] rounded-full w-40 h-16 flex items-center justify-center mt-8 mr-4 border-[#1ED760] border-2 hover:bg-[#F4F4FF]"
              onClick={async () => {
                try {
                  await signInWithSpotify();
                } catch (error) {
                  console.error('Error signing in with Spotify:', error);
                }
              }}
            >
              <text className="text-black font-light pr-2">
                Connect your
              </text>
              <FontAwesomeIcon icon={faSpotify} style={{ color: "#000000" }} className="w-8 h-12" />
            </button>
          </>
          :
          <>
            <button className='bg-[#1ED760] rounded-full w-16 h-16 flex items-center justify-center mt-8 mr-4 border-[#1ED760] border-2 justify-center"'>
              <Image className='text-black rounded-full' src = {spotifyUser.user_metadata.avatar_url} alt = "Spotify User" width={"56"} height={"56"}/>
            </button>
          </>
        }
        </div>
        {!isGenerating ? 
        (
          <>
            <div className="flex flex-col h-[80vh] w-full items-center justify-center overflow-hidden">
              <text className="text-white md:text-[80px] text-[60px] font-bold">Welcome</text>
              <text className="text-white md:text-[48px] text-[36px] font-bold">to</text>
              <div className = "flex flex-row w-full items-center justify-center">
                <text className="text-white md:text-[80px] text-[60px] font-bold">Wrapped</text> 
                <text className="text-[#1ED760] md:text-[80px] text-[60px] font-bold">AI</text>
              </div>
              <div className='flex items-center justify-center'>
                <text className='text-white md:text-[18px] text-[12px] font-light'>Get an AI generated image for 2023&apos;s Spotify Wrapped in seconds</text>
              </div>
              {isSigned ?
               (
                <>
                  <button className="bg-[#1ED760] rounded-full w-40 h-16 flex items-center justify-center mt-8 mr-4 border-[#1ED760] border-2 hover:bg-[#F4F4FF]" onClick={async () => {
                        try {
                          await getTopSongs();
                        } catch (error) {
                          console.error('Error getting songs:', error);
                        }
                      }}>
                    <text className="text-black font-light">Generate</text>
                  </button>
                </>
               ) : 
               (
                <>
                  <button className="bg-[#1ED760] rounded-full w-40 h-16 flex items-center justify-center mt-8 mr-4 border-[#1ED760] border-2 hover:bg-[#F4F4FF]" onClick={async () => {
                try {
                  await signInWithSpotify();
                } catch (error) {
                  console.error('Error signing in with Spotify:', error);
                }
              }}>
                    <text className="text-black font-light">Try Now</text>
                  </button>
                </>
               )
              }
            </div>
          </>
        )
        :
        (
          <div className='flex flex-col items-center justify-center'>
            <WrappedAIContent
              url={url}
              isGenerating={isGenerating}
              songs={songs}
              artists={artists}
              spotifyUser={spotifyUser}
            />
          </div>
        )
        }
      </div>
    </body>
  
  )
}

