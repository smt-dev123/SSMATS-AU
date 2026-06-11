import React, { useEffect, useState } from 'react'
import { Select } from '@radix-ui/themes'
import { useTranslation } from 'react-i18next'

const locales = ['km', 'en', 'zh']

const Language = () => {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'km')

  const handleChange = (value: string) => {
    setLang(value)
    i18n.changeLanguage(value)
    localStorage.setItem('lang', value)
  }

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  return (
    <Select.Root value={lang} onValueChange={handleChange}>
      <Select.Trigger variant="ghost" />
      <Select.Content>
        {locales.map((loc) => (
          <Select.Item key={loc} value={loc}>
            {loc.toUpperCase()}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

export default Language
