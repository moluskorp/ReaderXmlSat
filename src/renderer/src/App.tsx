import {
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  useTheme,
} from '@mui/material'
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

type XmlWithFormater = Xml & {
  totalFormatted: string
  discountFormatted: string
  subtotalFormatted: string
}

export function App() {
  const [directory, setDirectory] = useState('')
  const submitDisabled = !directory
  const [xmls, setXmls] = useState<XmlWithFormater[]>()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [xmlsFilter, setXmlsFilter] = useState<XmlWithFormater[]>()
  const [filterType, setFilterType] = useState<'discount' | 'cancel' | 'all'>(
    'all',
  )
  const theme = useTheme()

  // useEffect(() => {
  //   setLoadingFiles(true)
  //   window.api.xmlReadFiles().then(() => {
  //     setInterval(() => {
  //       setLoadingFiles(true)
  //       window.api.xmlReadFiles().then(() => {
  //         setLoadingFiles(false)
  //       })
  //     }, 2000)
  //     setLoadingFiles(false)
  //   })
  // }, [])

  console.log(xmlsFilter)

  const modalRef = useRef<XmlModalHandles>(null)

  const subtotal = xmlsFilter
    ? xmlsFilter.reduce((sumSubtotal, item) => {
        return sumSubtotal + item.subtotal
      }, 0)
    : 0

  const discount = xmls
    ? xmls.reduce((sumDiscount, item) => {
        return sumDiscount + item.discount
      }, 0)
    : 0

  const total = xmlsFilter
    ? xmlsFilter.reduce((sumTotal, item) => {
        return sumTotal + item.total
      }, 0)
    : 0

  const totalCancel = xmls
    ? xmls.reduce((sum, item) => {
        if (!item.active) {
          return sum + item.total
        }
        return sum + 0
      }, 0)
    : 0

  const mediaOrder = xmlsFilter
    ? xmlsFilter.length > 0
      ? formatPrice(total! / xmlsFilter.length!)
      : 0
    : 0

  const orderLenght = xmlsFilter ? xmlsFilter.length : 0
  const totalFormatted = formatPrice(total!)
  const subtotalFormatted = formatPrice(subtotal)
  const discountFormatted = formatPrice(discount)
  const totalCancelFormatted = formatPrice(totalCancel)

  async function handleOpenModal(xml: XmlWithFormater) {
    modalRef.current?.openModal(xml)
  }

  async function readXmls() {
    setLoading(true)
    const xmlsReads = await window.api.GetOrders({ startDate, endDate })
    const xmlsNew = xmlsReads.map((xml) => {
      return {
        ...xml,
        totalFormatted: formatPrice(xml.total),
        discountFormatted: formatPrice(xml.discount),
        subtotalFormatted: formatPrice(xml.subtotal),
      }
    })
    const filteredXmls = xmlsNew.filter((xml) => xml.active)
    setXmlsFilter(filteredXmls)
    setXmls(xmlsNew)
    setLoading(false)
  }

  function handleDiscount() {
    if (filterType === 'discount') {
      setFilterType('all')
      const filteredXmls = xmls?.filter((xml) => xml.active)
      setXmlsFilter(filteredXmls)
      return
    }
    setFilterType('discount')
    const filteredXmls = xmls?.filter((xml) => xml.discount > 0)
    setXmlsFilter(filteredXmls)
  }

  function handleCanceled() {
    if (filterType === 'cancel') {
      const filteredXmls = xmls?.filter((xml) => xml.active)
      setXmlsFilter(filteredXmls)
      setFilterType('all')
      return
    }
    const filteredXmls = xmls?.filter((xml) => !xml.active)
    setXmlsFilter(filteredXmls)
    setFilterType('cancel')
  }

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
        <Box display="flex" justifyContent="space-between" gap={2}>
          <Box display="flex" flex="1" flexDirection={'column'}>
            <Box display="flex" justifyContent="space-between" ml={1} mt={2}>
              <Typography variant="subtitle2">CFE</Typography>
              <Typography variant="subtitle2">Caixa</Typography>
              <Typography variant="subtitle2" mr={3}>
                Data
              </Typography>
              <Typography variant="subtitle2" ml={1}>
                Desconto
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
              {xmlsFilter?.map((xml) => (
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
                    <Typography variant="subtitle1" mr={2}>
                      {xml.pdv}
                    </Typography>
                    <Typography variant="subtitle1" mr={3}>
                      {xml.dEmi.toLocaleDateString()}
                    </Typography>
                    <Typography variant="subtitle1">
                      {xml.discountFormatted}
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
              <Typography>Valor Bruto:</Typography>
              <Typography variant="subtitle2">{subtotalFormatted}</Typography>
            </Box>
            <Box
              onClick={handleDiscount}
              color={
                filterType === 'discount' ? theme.palette.primary.main : ''
              }
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <Typography>Desconto:</Typography>
              <Typography variant="subtitle2">{discountFormatted}</Typography>
            </Box>
            <Box>
              <Typography>Valor Liquido:</Typography>
              <Typography variant="subtitle2">{totalFormatted}</Typography>
            </Box>
            <Box
              onClick={handleCanceled}
              color={filterType === 'cancel' ? theme.palette.primary.main : ''}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              <Typography>Cancelados:</Typography>
              <Typography variant="subtitle2">
                {totalCancelFormatted}
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography>Quantidade Vendas:</Typography>
              <Typography variant="subtitle2">{orderLenght}</Typography>
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
