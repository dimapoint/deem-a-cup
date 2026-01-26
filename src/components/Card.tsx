import React from 'react'

export default function Card() {
	return (
		<div>
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">Card</h1>
				<p className="text-sm text-gray-500">Card Description</p>
				<button className="bg-blue-500 text-white px-4 py-2 rounded-md">
					Button
				</button>
			</div>
		</div>
	)
}