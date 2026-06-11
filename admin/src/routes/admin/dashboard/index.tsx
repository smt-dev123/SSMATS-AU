import { useTitle } from '@/hooks/useTitle'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Table,
  Text,
  TextField,
  Spinner,
} from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import {
  IoSearch,
  IoPeople,
  IoSchool,
  IoPerson,
  IoExit,
  IoTrendingUp,
} from 'react-icons/io5'
import {
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  AreaChart,
  Area,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export const Route = createFileRoute('/admin/dashboard/')({
  component: RouteComponent,
})

// 1. Component ក្រាបសសរ
function StudentBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f0f0f0"
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '8px', border: 'none' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// 2. Component ក្រាបខ្សែ (Area Chart)
function AttendanceTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f0f0f0"
        />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorCount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function RouteComponent() {
  useTitle('Dashboard')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
        <Spinner size="3" />
      </Flex>
    )
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
        <Text color="red">
          មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។ សូមព្យាយាមម្តងទៀត។
        </Text>
      </Flex>
    )
  }

  const summary = data || {
    headerCards: {
      staffCount: 0,
      teacherCount: 0,
      studentCount: 0,
      dropoutCount: 0,
    },
    barData: [],
    trendData: [],
    topAtts: [],
  }

  const headerCards = [
    {
      title: 'បុគ្គលិក',
      count: summary.headerCards.staffCount || 0,
      icon: <IoPeople size="22" />,
      color: 'blue',
    },
    {
      title: 'គ្រូបង្រៀន',
      count: summary.headerCards.teacherCount || 0,
      icon: <IoSchool size="22" />,
      color: 'green',
    },
    {
      title: 'និស្សិត',
      count: summary.headerCards.studentCount || 0,
      icon: <IoPerson size="22" />,
      color: 'indigo',
    },
    {
      title: 'បោះបង់',
      count: summary.headerCards.dropoutCount || 0,
      icon: <IoExit size="22" />,
      color: 'red',
    },
  ]

  return (
    <Flex direction="column" gap="4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {headerCards.map((card, index) => (
          <Card key={index}>
            <Flex align="center" gap="3">
              <Box
                className={`p-2 rounded-md`}
                style={{
                  backgroundColor: `var(--${card.color}-3)`,
                  color: `var(--${card.color}-9)`,
                }}
              >
                {card.icon}
              </Box>
              <Flex direction="column">
                <Text size="1" color="gray">
                  {card.title}
                </Text>
                <Text size="5" weight="bold">
                  {card.count}
                </Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <Heading size="3" mb="3">
            ស្ថិតិនីស្សិតតាមជំនាញ
          </Heading>
          <StudentBarChart data={summary.barData} />
        </Card>
        <Card>
          <Flex align="center" gap="2" mb="3">
            <Heading size="3">និន្នាការវត្តមានប្រចាំសប្តាហ៍</Heading>
          </Flex>
          <AttendanceTrendChart data={summary.trendData} />
        </Card>
      </div>

      {/* Table Row */}
      <Card>
        <Flex justify="between" align="center" mb="4">
          <Heading size="3">និស្សិតវត្តមានច្រើនជាងគេ</Heading>
          <Box width="200px">
            <TextField.Root size="2" placeholder="ស្វែងរក...">
              <TextField.Slot>
                <IoSearch />
              </TextField.Slot>
            </TextField.Root>
          </Box>
        </Flex>
        <Table.Root variant="ghost" size="1">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>គោត្តនាម-នាម</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>ភេទ</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>មុខជំនាញ</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
                សកម្មភាព
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {summary.topAtts.map((att: any, index: number) => (
              <Table.Row key={index} align="center">
                <Table.RowHeaderCell>
                  <Text weight="bold">{att.name}</Text>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <Badge
                    color={att.gender === 'female' ? 'pink' : 'blue'}
                    variant="soft"
                  >
                    {att.gender === 'female' ? 'ស្រី' : 'ប្រុស'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{att.department}</Table.Cell>
                <Table.Cell align="right">
                  <Button variant="ghost" size="1">
                    បង្ហាញ
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>
    </Flex>
  )
}
