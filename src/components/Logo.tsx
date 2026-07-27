import Image from 'next/image'
import logoHeader from '../../public/logo-header.png'

export default function Logo() {
  return (
    <Image
      src={logoHeader}
      alt="Terroncin Logo"
      width={180}
      height={50}
      className="h-10 sm:h-12 w-auto object-contain"
    />
  )
}
