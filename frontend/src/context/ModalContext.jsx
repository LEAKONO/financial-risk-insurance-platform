// frontend/src/context/ModalContext.jsx
import React, { createContext, useState, useContext } from 'react'

const ModalContext = createContext({})

export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({})

  const openModal = (modalName, props = {}) => {
    setModals(prev => ({ ...prev, [modalName]: { open: true, props } }))
  }

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: { open: false, props: {} } }))
  }

  const value = {
    modals,
    openModal,
    closeModal,
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}