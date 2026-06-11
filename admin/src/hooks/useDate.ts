import dayjs from '@/lib/dayjs'

export const formatDate = (date: string | Date | undefined) => {
  const d = dayjs(date)

  return {
    // ១៦ មេសា ២០២៦
    display: (format = 'LL', locale = 'km') => d.locale(locale).format(format),

    fromNow: (locale = 'km') => d.locale(locale).fromNow(),

    toZone: (zone: any) => d.tz(zone).format('LLL'),

    toApi: () => d.utc().format(),

    raw: d,
  }
}
