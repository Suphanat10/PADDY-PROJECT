import './globals.css'
import { Kanit } from 'next/font/google'


const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '700'], 
  display: 'swap',
})

export const metadata = {
  title: 'PaddySmart',
  description: 'This is a login app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={kanit.className}>
      <body>
        {children}
      </body>
    </html>
  )
}