export function EmailInput() {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="email" className="text-sm font-medium text-gray-300">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="you@example.com"
      />
    </div>
  )
}
