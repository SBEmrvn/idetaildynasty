import { createContext, useContext } from 'react'

/**
 * Every piece of editable website wording, with today's text as the default.
 * Admins override any of these from Admin → Website; overrides are stored in
 * `settings.content` (jsonb). Anything not overridden falls back to these.
 */
export const DEFAULT_CONTENT = {
  // Brand & footer
  brand_name: 'iDetail Dynasty',
  footer_tagline: 'Premium car detailing, done right every time.',

  // Home banner
  home_eyebrow: 'Premium car detailing',
  home_title: 'Your car deserves',
  home_title_accent: 'Dynasty',
  home_title_end: 'treatment',
  home_subtitle: "Professional detailing that restores, protects and transforms your vehicle. We don't just clean cars, we perfect them.",
  home_cta_primary: 'Book appointment',
  home_cta_secondary: 'View promos',

  // Services page
  services_label: 'What We Offer',
  services_title: 'Our Services',
  services_subtitle: 'Every service is performed by hand with premium products — because your car deserves nothing less.',
  services_cta: 'Book Any Service',

  // Gallery page
  gallery_label: 'Our Work',
  gallery_title: 'Before & After',
  gallery_subtitle: 'Real results from real cars. See the Dynasty difference.',
  gallery_cta: 'Book Your Detail',

  // Reviews page
  reviews_label: 'What Clients Say',
  reviews_title: 'Reviews',
  reviews_cta_label: 'Ready?',
  reviews_cta_title: 'Experience It Yourself',

  // Promos page
  promos_label: 'Deals & Offers',
  promos_title: 'Current Promotions',
  promos_subtitle: 'Exclusive deals for our valued customers. Show the code at booking to redeem.',

  // Booking page
  booking_label: 'Schedule a Visit',
  booking_title: 'Book Your Appointment',
  booking_subtitle: "Choose your service, pick a time and we'll take care of the rest.",
  booking_done_title: "You're All Set!",

  // Contact page
  contact_label: 'Get In Touch',
  contact_title: 'Contact Us',
  contact_subtitle: "We're here to help. Reach out any way you prefer.",
  contact_whatsapp_note: 'Fastest response — tap to chat',
  contact_call_note: 'Mon–Sat, 8am–6pm',
  contact_email_note: 'We reply within 24 hours',
  contact_location_note: 'Mobile detailing available too',
}

/** Groups shown in the admin editor, in order. `long` fields get a textarea. */
export const CONTENT_SECTIONS = [
  { title: 'Brand & footer', page: '/', fields: [
    ['brand_name', 'Business name', 'Shown in the header, footers and login pages'],
    ['footer_tagline', 'Footer tagline', null, true],
  ] },
  { title: 'Home page banner', page: '/', fields: [
    ['home_eyebrow', 'Small label above the headline'],
    ['home_title', 'Headline (start)'],
    ['home_title_accent', 'Headline highlighted word', 'Shown in the peach italic style'],
    ['home_title_end', 'Headline (end)'],
    ['home_subtitle', 'Intro text', null, true],
    ['home_cta_primary', 'Main button'],
    ['home_cta_secondary', 'Second button'],
  ] },
  { title: 'Services page', page: '/services', fields: [
    ['services_label', 'Small label'], ['services_title', 'Heading'],
    ['services_subtitle', 'Intro text', null, true], ['services_cta', 'Button'],
  ] },
  { title: 'Gallery page', page: '/gallery', fields: [
    ['gallery_label', 'Small label'], ['gallery_title', 'Heading'],
    ['gallery_subtitle', 'Intro text', null, true], ['gallery_cta', 'Button'],
  ] },
  { title: 'Reviews page', page: '/reviews', fields: [
    ['reviews_label', 'Small label'], ['reviews_title', 'Heading'],
    ['reviews_cta_label', 'Bottom call-to-action label'], ['reviews_cta_title', 'Bottom call-to-action heading'],
  ] },
  { title: 'Promos page', page: '/promos', fields: [
    ['promos_label', 'Small label'], ['promos_title', 'Heading'],
    ['promos_subtitle', 'Intro text', null, true],
  ] },
  { title: 'Booking page', page: '/booking', fields: [
    ['booking_label', 'Small label'], ['booking_title', 'Heading'],
    ['booking_subtitle', 'Intro text', null, true],
    ['booking_done_title', 'Heading after a booking is sent'],
  ] },
  { title: 'Contact page', page: '/contact', fields: [
    ['contact_label', 'Small label'], ['contact_title', 'Heading'],
    ['contact_subtitle', 'Intro text', null, true],
    ['contact_whatsapp_note', 'Note under WhatsApp'], ['contact_call_note', 'Note under phone'],
    ['contact_email_note', 'Note under email'], ['contact_location_note', 'Note under location'],
  ] },
]

/** Merge stored overrides onto defaults; blank overrides fall back to the default. */
export function mergeContent(stored) {
  const out = { ...DEFAULT_CONTENT }
  if (stored && typeof stored === 'object') {
    for (const k of Object.keys(DEFAULT_CONTENT)) {
      const v = stored[k]
      if (typeof v === 'string' && v.trim()) out[k] = v
    }
  }
  return out
}

export const ContentContext = createContext(DEFAULT_CONTENT)
export const useContent = () => useContext(ContentContext)
