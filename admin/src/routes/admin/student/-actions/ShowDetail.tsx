import {
  Avatar,
  Badge,
  Box,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Text,
  Card,
  Heading,
  Button,
} from '@radix-ui/themes'
import {
  FaRegEye,
  FaUser,
  FaInfoCircle,
  FaSchool,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
} from 'react-icons/fa'
import type { StudentsType } from '@/types'

interface Props {
  data: StudentsType
}

const getStatusColor = (status: StudentsType['educationalStatus']) => {
  switch (status) {
    case 'enrolled':
      return 'green'
    case 'suspended':
      return 'yellow'
    case 'graduated':
      return 'blue'
    case 'dropped_out':
      return 'red'
    case 'transferred':
      return 'orange'
    default:
      return 'gray'
  }
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  color = 'indigo',
}: {
  icon: any
  label: string
  value: string | number | undefined
  color?: any
}) => (
  <Flex align="center" gap="3" mb="3">
    <Flex
      align="center"
      justify="center"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: `var(--${color}-3)`,
        color: `var(--${color}-9)`,
      }}
    >
      <Icon size={14} />
    </Flex>
    <Box>
      <Text
        size="1"
        color="gray"
        weight="bold"
        as="div"
        style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {label}
      </Text>
      <Text size="2" weight="medium">
        {value || '---'}
      </Text>
    </Box>
  </Flex>
)

const StudentDetail = ({ data }: Props) => {
  const imageUrl = data.image
    ? `${import.meta.env.VITE_API_BASE_URL}${data.image}`.replace('/api', '')
    : ''

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton
          size="1"
          color="cyan"
          variant="surface"
          style={{ cursor: 'pointer' }}
        >
          <FaRegEye />
        </IconButton>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="750px"
        style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}
      >
        {/* Header with Background */}
        <Box
          style={{
            height: '120px',
            background: 'linear-gradient(135deg, #00529B 0%, #0078D4 100%)',
            position: 'relative',
          }}
        >
          <Flex
            position="absolute"
            style={{ bottom: '-40px', left: '32px' }}
            align="end"
            gap="4"
          >
            <Avatar
              size="7"
              src={imageUrl}
              fallback={data.name?.charAt(0) || 'S'}
              radius="full"
              style={{
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '100px',
                height: '100px',
              }}
            />
            <Box mb="3">
              <Heading
                size="6"
                style={{
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {data.name}
              </Heading>
              <Text size="2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {data.studentCode} • {data.nameEn}
              </Text>
            </Box>
          </Flex>

          <Box position="absolute" top="4" right="4">
            <Badge
              color={getStatusColor(data.educationalStatus)}
              variant="solid"
              size="2"
            >
              {data.educationalStatus?.toUpperCase()}
            </Badge>
          </Box>
        </Box>

        <Box p="6" pt="9">
          <Grid columns={{ initial: '1', md: '2' }} gap="6">
            {/* Left Column: Personal Information */}
            <Box>
              <Flex align="center" gap="2" mb="4">
                <FaUser color="var(--indigo-9)" />
                <Heading size="3" color="indigo">
                  ព័ត៌មានផ្ទាល់ខ្លួន
                </Heading>
              </Flex>

              <Card variant="surface" style={{ padding: '16px' }}>
                <InfoItem
                  icon={FaUser}
                  label="ភេទ"
                  value={data.gender === 'male' ? 'ប្រុស' : 'ស្រី'}
                />
                <InfoItem
                  icon={FaCalendarAlt}
                  label="ថ្ងៃខែឆ្នាំកំណើត"
                  value={
                    data.dob
                      ? new Date(data.dob).toLocaleDateString('km-KH')
                      : '---'
                  }
                />
                <InfoItem
                  icon={FaEnvelope}
                  label="អ៊ីម៉ែល"
                  value={data.email}
                />
                <InfoItem
                  icon={FaPhoneAlt}
                  label="លេខទូរស័ព្ទ"
                  value={data.phone}
                />
                <InfoItem
                  icon={FaMapMarkerAlt}
                  label="អាស័យដ្ឋាន"
                  value={data.address}
                />
              </Card>
            </Box>

            {/* Right Column: Academic Information */}
            <Box>
              <Flex align="center" gap="2" mb="4">
                <FaSchool color="var(--indigo-9)" />
                <Heading size="3" color="indigo">
                  ព័ត៌មានការសិក្សា
                </Heading>
              </Flex>

              <Card variant="surface" style={{ padding: '16px' }}>
                <InfoItem
                  icon={FaInfoCircle}
                  label="ជំនាន់"
                  value={data.generation || '---'}
                  color="green"
                />
                <InfoItem
                  icon={FaInfoCircle}
                  label="ឆ្នាំសិក្សា"
                  value={
                    (data as any).academicYear?.name ||
                    `ឆ្នាំទី ${data.year} ឆមាស ${data.semester}`
                  }
                  color="green"
                />
                <InfoItem
                  icon={FaSchool}
                  label="កម្រិតសិក្សា"
                  value={(data as any).academicLevel?.level || '---'}
                  color="orange"
                />
                <InfoItem
                  icon={FaSchool}
                  label="មហាវិទ្យាល័យ"
                  value={(data as any).faculty?.name || '---'}
                  color="orange"
                />
                <InfoItem
                  icon={FaSchool}
                  label="ដេប៉ាតឺម៉ង់"
                  value={(data as any).department?.name || '---'}
                  color="orange"
                />
                <InfoItem
                  icon={FaSchool}
                  label="ជំនាញ"
                  value={(data as any).skill?.name || '---'}
                  color="orange"
                />
              </Card>
            </Box>
          </Grid>

          <Flex justify="end" mt="6" gap="3">
            <Dialog.Close>
              <Button
                variant="soft"
                color="gray"
                size="2"
                style={{ cursor: 'pointer' }}
              >
                បិទ
              </Button>
            </Dialog.Close>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default StudentDetail
