import { useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import './TextInput.css'

export default function TextInput({ onTextInput, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onTextInput(input)
      setInput('')
    }
  }

  return (
    <form className="text-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        autoFocus
      />
      <button type="submit" disabled={disabled || !input.trim()}>
        <FaPaperPlane />
      </button>
    </form>
  )
}
