import { AlertDialog, Button, Flex } from '@radix-ui/themes'

interface Props {
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
}

const DeleteDialog = ({
  title,
  description,
  onConfirm,
  onCancel,
  isLoading,
}: Props) => (
  <AlertDialog.Content maxWidth="450px">
    <AlertDialog.Title>{title}</AlertDialog.Title>
    <AlertDialog.Description size="2">{description}</AlertDialog.Description>

    <Flex gap="3" mt="4" justify="end">
      <AlertDialog.Cancel>
        <Button variant="soft" color="gray" onClick={onCancel}>
          ចាកចេញ
        </Button>
      </AlertDialog.Cancel>

      <AlertDialog.Action>
        <Button
          variant="solid"
          color="red"
          onClick={onConfirm}
          disabled={isLoading}
        >
          បាទ/ចាស
        </Button>
      </AlertDialog.Action>
    </Flex>
  </AlertDialog.Content>
)

export default DeleteDialog
