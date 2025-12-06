import { useState, useEffect, useMemo, type JSX } from "react"
import { Button, Box, Autocomplete, TextField } from "@mui/material"
import { Sync as SyncIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchGroups, selectGroups } from "@/features/groups/store/groupsSlice"
import { setFilterGroupId, selectFilterGroupId } from "@/features/whatsapp/store/whatsappSlice"
import { SyncWhatsappDialog } from "./SyncWhatsappDialog"

export const WhatsappControls = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const [modalOpen, setModalOpen] = useState(false)
  const groups = useAppSelector(selectGroups)
  const filterGroupId = useAppSelector(selectFilterGroupId)

  useEffect(() => {
    if (groups.length === 0) {
      dispatch(fetchGroups())
    }
  }, [dispatch, groups.length])

  const groupOptions = useMemo(
    () => groups.map(g => ({ label: g.name, value: g._id })),
    [groups]
  )

  const handleSyncWhatsapp = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleFilterChange = (_: any, val: { label: string; value: string } | null) => {
    const newGroupId = val ? val.value : null
    dispatch(setFilterGroupId(newGroupId))
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "space-between", flexWrap: "wrap" }}>
        <Autocomplete
          sx={{ minWidth: 280 }}
          options={groupOptions}
          value={groupOptions.find(o => o.value === filterGroupId) || null}
          onChange={handleFilterChange}
          renderInput={(params) => <TextField {...params} label={t("filterByGroup") || "undefined"} />}
          clearOnEscape
        />
        <Button
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={handleSyncWhatsapp}
          sx={{ minWidth: 150 }}
        >
          {t("syncWhatsapp")}
        </Button>
      </Box>

      <SyncWhatsappDialog open={modalOpen} onClose={handleCloseModal} />
    </>
  )
}
