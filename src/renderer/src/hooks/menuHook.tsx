import { useState } from 'react'
import { createStore } from 'reusable'

export const menuHook = createStore(() => useState('MainHomeView'))
