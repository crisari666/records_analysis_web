import { useState, useEffect, useMemo, type JSX } from "react"
import { Button, Box, Autocomplete, TextField } from "@mui/material"
import { Sync as SyncIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchProjects, selectProjects } from "@/features/projects/store/projectsSlice"
import { setFilterProjectId, selectFilterProjectId } from "@/features/groups/store/groupsSlice"
import { SyncWhatsappDialog } from "./SyncWhatsappDialog"

export const WhatsappControls = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const [modalOpen, setModalOpen] = useState(false)
  const projects = useAppSelector(selectProjects)
  const filterProjectId = useAppSelector(selectFilterProjectId)

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects())
    }
  }, [dispatch, projects.length])

  const projectOptions = useMemo(
    () => projects.map(p => ({ label: p.title, value: p._id })),
    [projects]
  )

  const handleSyncWhatsapp = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleFilterChange = (_: any, val: { label: string; value: string } | null) => {
    const newProjectId = val ? val.value : null
    dispatch(setFilterProjectId(newProjectId))
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "space-between", flexWrap: "wrap" }}>
        <Autocomplete
          sx={{ minWidth: 280 }}
          options={projectOptions}
          value={projectOptions.find(o => o.value === filterProjectId) || null}
          onChange={handleFilterChange}
          renderInput={(params) => <TextField {...params} label={t("filterByProject") || "Filter by Project"} />}
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
