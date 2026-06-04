'use client'

import { useState, useCallback, useRef } from 'react'
import Map, {
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
  type MapRef,
} from 'react-map-gl/mapbox'
import Link from 'next/link'
import type { Hospital } from '@/types'
import 'mapbox-gl/dist/mapbox-gl.css'

interface HospitalMapProps {
  hospitals: Hospital[]
}
const SPECIALTY_COLORS: Record<string, string> = {
  emergency: '#ef4444',
  maternity: '#ec4899',
  pediatric: '#3b82f6',
  cardiology: '#f43f5e',
  general: '#10b981',
  dental: '#eab308',
  orthopedic: '#f97316',
  ophthalmology: '#8b5cf6',
  neurology: '#6366f1',
  oncology: '#7c3aed',
}

function getMarkerColor(hospital: Hospital): string {
  if (hospital.specialties.length > 0) {
    return SPECIALTY_COLORS[hospital.specialties[0]] ?? '#10b981'
  }
  return '#10b981'
}

interface PopupInfo {
  hospital: Hospital
  latitude: number
  longitude: number
}

export default function HospitalMap({ hospitals }: HospitalMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)
  const [viewState, setViewState] = useState({
    latitude: 9.082,
    longitude: 8.6753,
    zoom: 5.5,
  })

  const handleGeolocate = useCallback((e: { coords: { latitude: number; longitude: number } }) => {
    setViewState((prev) => ({
      ...prev,
      latitude: e.coords.latitude,
      longitude: e.coords.longitude,
      zoom: 11,
    }))
  }, [])

  function fitToHospitals() {
    if (hospitals.length === 0 || !mapRef.current) return

    const lats = hospitals.map((h) => h.latitude)
    const lngs = hospitals.map((h) => h.longitude)

    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 13 }
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-neutral-200">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setPopupInfo(null)}
      >
        {/* Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation onGeolocate={handleGeolocate} />

        {/* Hospital Markers */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            latitude={hospital.latitude}
            longitude={hospital.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setPopupInfo({
                hospital,
                latitude: hospital.latitude,
                longitude: hospital.longitude,
              })
            }}
          >
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
              style={{ backgroundColor: getMarkerColor(hospital) }}
              title={hospital.name}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-white"
              >
                <path d="M11.25 3.375A8.625 8.625 0 1 0 20.625 12 8.625 8.625 0 0 0 11.25 3.375ZM12 7.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 12 7.5Z" />
              </svg>
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            anchor="bottom"
            offset={36}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            className="hospital-popup"
          >
            <div className="min-w-48 p-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold leading-tight text-neutral-900">
                  {popupInfo.hospital.name}
                </h3>
                <button
                  onClick={() => setPopupInfo(null)}
                  className="shrink-0 text-neutral-400 hover:text-neutral-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="mb-1.5 text-xs text-neutral-500">
                {popupInfo.hospital.lga}, {popupInfo.hospital.city}
              </p>

              <div className="mb-2 flex flex-wrap gap-1">
                {popupInfo.hospital.specialties.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs capitalize text-emerald-700"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    popupInfo.hospital.ownership === 'public' ? 'text-blue-600' : 'text-amber-600'
                  }`}
                >
                  {popupInfo.hospital.ownership}
                </span>
                <Link
                  href={`/hospitals/${popupInfo.hospital.id}`}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Fit to results button */}
      {hospitals.length > 0 && (
        <button
          onClick={fitToHospitals}
          className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-md transition-colors hover:bg-neutral-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
          Fit to results ({hospitals.length})
        </button>
      )}

      {/* Hospital count badge */}
      <div className="absolute left-4 top-4 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-md">
        {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} on map
      </div>
    </div>
  )
}
