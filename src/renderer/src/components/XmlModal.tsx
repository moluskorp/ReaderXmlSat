import {
  Box,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { forwardRef, useState, useImperativeHandle } from 'react'
import { Xml } from '~/src/shared/types/xml'
import { formatPrice } from '../util/formatPrice'

type XmlModalType = Xml & {
  totalFormatted: string
}

type XmlModalInstance = {
  cfe: string
  dEmi: Date
  pdv: string
  total: number
  totalFormatted: string
  items: {
    id: string
    itemid: string
    name: string
    nitem: number
    price: number
    priceFormatted: string
    quantity: number
    total: number
    totalFormatted: string
  }[]
}

export interface XmlModalHandles {
  openModal: (data: XmlModalType) => void
}

export const XmlModal = forwardRef<XmlModalHandles>(function XmlModal(_, ref) {
  const [modalOpen, setModalOpen] = useState(false)
  const [xml, setXml] = useState<XmlModalInstance>()

  useImperativeHandle(ref, () => {
    return {
      openModal,
    }
  })

  console.log('xml', xml)

  const openModal = async (data: XmlModalType) => {
    const items = await window.api.xmlItemsGet(data.id)
    const itemsFormatted = items.map((item) => {
      return {
        ...item,
        priceFormatted: formatPrice(item.price),
        totalFormatted: formatPrice(item.total),
      }
    })
    const newXml = {
      ...data,
      items: itemsFormatted,
    }
    console.log('newXml', newXml)
    setXml(newXml)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <Modal open={modalOpen} onClose={closeModal}>
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'white',
          outline: 'none',
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          display: 'flex',
        }}
      >
        <Box display="flex" justifyContent={'space-between'}>
          <Box display="flex" flexDirection={'column'} alignItems={'start'}>
            <Typography variant="h5">CFE: {xml?.cfe}</Typography>
            <Typography variant="subtitle2">PDV: {xml?.pdv}</Typography>
          </Box>
          <Box display="flex" flexDirection={'column'} alignItems={'end'}>
            <Typography variant="h5">
              {xml?.dEmi.toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle2">
              {xml?.dEmi.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent={'space-between'} mt={2}>
          <Typography variant="h4">Total:</Typography>
          <Typography variant="h4">{xml?.totalFormatted}</Typography>
        </Box>
        <Box mt={2} />
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="center">Preço</TableCell>
              <TableCell align="center">QTD</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {xml?.items.map((item) => (
              <TableRow
                key={item.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{item.nitem}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell align="center">{item.priceFormatted}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="center">{item.totalFormatted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          variant="contained"
          color="error"
          onClick={closeModal}
          sx={{ mt: 2 }}
        >
          Fechar
        </Button>
      </Box>
    </Modal>
  )
})
