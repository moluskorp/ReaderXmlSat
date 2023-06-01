import { Box, CircularProgress, Typography } from '@mui/material'

interface Props {
  loading: boolean
}

export function LoadingFiles({ loading }: Props) {
  if (loading) {
    return (
      <Box
        sx={{ position: 'absolute' as 'absolute', bottom: '0%', right: '0%' }}
        pr={2}
        display="flex"
        alignItems="center"
        gap={0.5}
      >
        <CircularProgress size={16} color="secondary" />
        <Typography color="GrayText">Carregando arquivos</Typography>
      </Box>
    )
  }
  return <></>
}
