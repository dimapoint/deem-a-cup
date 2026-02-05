'use client'

import React, {useState} from 'react'
import {X} from 'lucide-react'

export function TagsInput() {
	const [tags, setTags] = useState<string[]>([])
	const [currentTag, setCurrentTag] = useState('')

	const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
		if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return
		e.preventDefault()

		const trimmedTag = currentTag.trim()
		if (trimmedTag && !tags.includes(trimmedTag)) {
			setTags([...tags, trimmedTag])
			setCurrentTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove))
	}

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="tags-input" className="text-sm font-medium">Tags</label>
			<div className="flex flex-wrap gap-2 mb-1">
				{tags.map(tag => (
					<span key={tag}
					      className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            #{tag}
						<button type="button" onClick={() => removeTag(tag)}
						        className="hover:text-orange-950 focus:outline-none">
              <X size={12}/>
            </button>
          </span>
				))}
			</div>
			<div className="flex gap-2">
				<input
					id="tags-input"
					type="text"
					value={currentTag}
					onChange={(e) => setCurrentTag(e.target.value)}
					onKeyDown={handleAddTag}
					className="flex-1 rounded border border-gray-300 p-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-200"
					placeholder="Add a tag (e.g. Wifi, V60)..."
				/>
				<button
					type="button"
					onClick={handleAddTag}
					className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
				>
					Add
				</button>
			</div>
			<input type="hidden" name="tags" value={JSON.stringify(tags)}/>
		</div>
	)
}
