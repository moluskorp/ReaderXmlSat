import { Button, TextField, Box, Typography, Divider } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useEffect, useRef, useState } from 'react'
import { Xml } from '~/src/shared/types/xml'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { formatPrice } from './util/formatPrice'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import pt from 'date-fns/locale/pt-BR'
import { XmlModal, XmlModalHandles } from './components/XmlModal'
import { LoadingFiles } from './components/LoadingFiles'

export function App() {
  const [directory, setDirectory] = useState('')
  const submitDisabled = !directory
  const [xmls, setXmls] = useState<Xml[]>()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [loadingFiles, setLoadingFiles] = useState(true)

  useEffect(() => {
    setLoadingFiles(true)
    window.api.xmlReadFiles().then(() => {
      setInterval(() => {
        setLoadingFiles(true)
        window.api.xmlReadFiles().then(() => {
          setLoadingFiles(false)
        })
      }, 2000)
      setLoadingFiles(false)
    })
  }, [])

  const modalRef = useRef<XmlModalHandles>(null)

  const total = xmls?.reduce((sumTotal, item) => {
    return sumTotal + item.total
  }, 0)

  const mediaOrder = formatPrice(total! / xmls?.length!)

  const totalFormatted = formatPrice(total!)

  const xmlsNew = xmls?.map((xml) => {
    return {
      ...xml,
      totalFormatted: formatPrice(xml.total),
    }
  })

  async function handleOpenModal(xml: Xml & { totalFormatted: string }) {
    if (xmlsNew) {
      modalRef.current?.openModal(xml)
    }
  }

  async function readXmls() {
    setLoading(true)
    const xmls = await window.api.GetOrders({ startDate, endDate })
    setXmls(xmls)
    setLoading(false)
  }

  console.log(xmls)

  useEffect(() => {
    window.api.getDirectory().then((folder) => {
      if (folder) {
        setDirectory(folder.directory)
      }
    })
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pt}>
      <Box display={'flex'} flex={'1'} flexDirection={'column'}>
        <LoadingFiles loading={loadingFiles} />
        <XmlModal ref={modalRef} />
        <Typography variant="h4" justifySelf={'center'} alignSelf={'center'}>
          Leitor de vendas de Pdv
        </Typography>
        <Box
          display={'flex'}
          width={'100%'}
          gap={2}
          alignItems={'center'}
          justifyContent={'center'}
          mt={2}
        >
          <Button
            variant="contained"
            disabled={loading}
            onClick={(): void => {
              window.api.changeDirectory().then((result) => {
                if (result) {
                  setDirectory(String(result))
                }
              })
            }}
          >
            Selecionar
          </Button>
          <TextField
            type="text"
            onChange={(e): void => {
              setDirectory(e.target.value)
            }}
            value={directory}
            disabled
            size={'small'}
            fullWidth
          />
        </Box>
        <Box
          display={'flex'}
          mt={2}
          width={'100%'}
          justifyContent={'space-between'}
        >
          <DatePicker
            label="Data inicial"
            value={startDate}
            onChange={(e) => setStartDate(e!)}
            maxDate={new Date()}
          />
          <DatePicker
            label="Data final"
            minDate={startDate}
            maxDate={new Date()}
            value={endDate}
            onChange={(e) => setEndDate(e!)}
          />
          <LoadingButton
            variant="contained"
            loading={loading}
            onClick={readXmls}
            disabled={submitDisabled}
          >
            Iniciar
          </LoadingButton>
        </Box>
        <Box display="flex" flex="1" justifyContent="space-between" gap={2}>
          <Box display="flex" flex="1" flexDirection={'column'}>
            <Box
              display="flex"
              flex="1"
              justifyContent="space-between"
              ml={1}
              mt={2}
            >
              <Typography variant="subtitle2">CFE</Typography>
              <Typography variant="subtitle2">Caixa</Typography>
              <Typography variant="subtitle2" mr={2}>
                Data
              </Typography>
              <Box width={'12%'} display="flex" justifySelf="flex-end">
                <Typography variant="subtitle2">Total</Typography>
              </Box>
            </Box>
            <Box
              display="flex"
              gap={1}
              flexDirection={'column'}
              mt={2}
              sx={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 240px)' }}
            >
              {xmlsNew?.map((xml) => (
                <Button
                  key={xml.id}
                  variant="outlined"
                  size="medium"
                  onClick={() => {
                    handleOpenModal(xml)
                  }}
                >
                  <Box display="flex" flex="1" justifyContent="space-between">
                    <Typography variant="subtitle1">{xml.cfe}</Typography>
                    <Typography variant="subtitle1">{xml.pdv}</Typography>
                    <Typography variant="subtitle1">
                      {xml.dEmi.toLocaleDateString()}
                    </Typography>
                    <Box width={'12%'} display="flex" justifySelf="flex-end">
                      <Typography variant="subtitle1">
                        {xml.totalFormatted}
                      </Typography>
                    </Box>
                  </Box>
                </Button>
              ))}
            </Box>
          </Box>
          <Divider
            variant="middle"
            color="black"
            sx={{
              borderColor: 'gray',
              borderStyle: 'solid',
              margin: '0px',
              overflow: 'hidden',
              flexShrink: '0',
              borderLeftWidth: 'thin',
              marginTop: '4.5rem',
              marginBottom: '1rem',
            }}
          />
          <Box display="flex" flexDirection="column" mt={6} gap={2} mr={2}>
            <Box>
              <Typography>Total:</Typography>
              <Typography variant="subtitle2">{totalFormatted}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography>Quantidade Vendas:</Typography>
              <Typography variant="subtitle2">{xmlsNew?.length}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography>Média por Cupom</Typography>
              <Typography variant="subtitle2">{mediaOrder}</Typography>
            </Box>
            <Divider />
            {/* <Box
              onClick={() => {
                alert('Clicou')
              }}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <Typography>Total Desconto</Typography>
              <Typography variant="subtitle2">{10}</Typography>
            </Box>
            <Box
              onClick={() => {
                alert('Clicou')
              }}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <Typography>Total Acréscimo</Typography>
              <Typography variant="subtitle2">{10}</Typography>
            </Box> */}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}
