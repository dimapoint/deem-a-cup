'use client'

export function ListFormFields() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-300">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          placeholder="e.g. Best Work Spots"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-300">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="rounded border border-gray-700 bg-[#15191f] p-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500 resize-none"
          placeholder="What is this list about?"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_ranked"
          name="is_ranked"
          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
        <label htmlFor="is_ranked" className="text-sm text-gray-300">
          Ranked List (1, 2, 3...)
        </label>
      </div>
    </>
  )
}
