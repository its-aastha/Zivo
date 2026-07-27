import { useState, useRef } from 'react'
import { FaMicrophone, FaStop } from 'react-icons/fa'
import './VoiceInput.css'

export default function VoiceInput({ onVoiceInput, isListening, setIsListening }) {
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        onVoiceInput(audioBlob)
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  return (
    <div className="voice-input">
      {!isListening ? (
        <button className="mic-button" onClick={startListening}>
          <FaMicrophone /> Start Listening
        </button>
      ) : (
        <button className="mic-button recording" onClick={stopListening}>
          <FaStop /> Stop Listening
        </button>
      )}
    </div>
  )
}
