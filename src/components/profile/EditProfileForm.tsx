import {ProfileRow} from '@/types/profile'
import {updateProfile} from '@/app/profile/actions'

interface EditProfileFormProps {
	profile: ProfileRow
}

export function EditProfileForm({profile}: EditProfileFormProps) {
	return (
		<div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
			<h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
				Edit Details
			</h3>
			<form action={updateProfile} className="space-y-3">
				<div className="space-y-1">
					<label htmlFor="full_name"
					       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
						Full Name
					</label>
					<input
						type="text"
						id="full_name"
						name="full_name"
						defaultValue={profile.full_name || ''}
						className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
						placeholder="Jane Doe"
					/>
				</div>
				<div className="space-y-1">
					<label htmlFor="username"
					       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						defaultValue={profile.username || ''}
						className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
						placeholder="coffee_lover"
					/>
				</div>
				<div className="space-y-1">
					<label htmlFor="website"
					       className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
						Website
					</label>
					<input
						type="url"
						id="website"
						name="website"
						defaultValue={profile.website || ''}
						className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
						placeholder="https://example.com"
					/>
				</div>
				<button
					type="submit"
					className="w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600"
				>
					Update Profile
				</button>
			</form>
		</div>
	)
}
