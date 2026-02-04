import {CafeCore} from '@/types/profile'
import {TopCafesList} from '@/components/profile/TopCafesList'
import {ProfileInfo} from '@/components/profile/ProfileInfo'

interface ProfileSidebarProps {
	email?: string | null
	lastVisit: string | null
	ratedDeemsCount: number
	favoriteCafes: CafeCore[]
	children?: React.ReactNode
}

export function ProfileSidebar({
	                               email,
	                               lastVisit,
	                               ratedDeemsCount,
	                               favoriteCafes,
	                               children
                               }: ProfileSidebarProps) {
	return (
		<aside className="space-y-4">
			{children}

			<ProfileInfo
				email={email}
				lastVisit={lastVisit}
				ratedDeemsCount={ratedDeemsCount}
			/>

			<TopCafesList cafes={favoriteCafes}/>
		</aside>
	)
}
