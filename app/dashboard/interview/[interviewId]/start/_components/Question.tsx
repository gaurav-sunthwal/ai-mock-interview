import React from 'react'

export default function Question({question , answer}:{question:string , answer:string}) {
  return (
    <div>
      <h1>{question}</h1>
      {/* <h1>: {answer}</h1> */}
    </div>
  )
}
