interface InputFieldProps {
	id: string
	label: string
	type?: string
	defaultValue: string
	placeholder: string
}

export function InputField({id, label, type = 'text', defaultValue, placeholder}: InputFieldProps) {
	return (
		<div className="space-y-1">
			<label htmlFor={id}
			       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
				{label}
			</label>
			<input
				type={type}
				id={id}
				name={id}
				defaultValue={defaultValue}
				className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
				placeholder={placeholder}
			/>
		</div>
	)
}
