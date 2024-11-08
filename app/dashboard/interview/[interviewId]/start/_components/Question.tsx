import React from 'react'

export default function Question({question , answer}:{question:string , answer:string}) {
  return (
    <div>
      <h1>{question}</h1>
      <h2>{answer}</h2> {/* Displaying the answer */}
    </div>
  )
}
