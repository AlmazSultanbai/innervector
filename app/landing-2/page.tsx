import { redirect } from 'next/navigation'

// The light landing is now the main homepage. Keep this route as a permanent
// alias so existing links to /landing-2 still work.
export default function LandingTwoRedirect() {
  redirect('/')
}
