import { useEffect, useState } from 'react';
import { fuelTransactionApi, vehicleApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { FuelTransaction, Vehicle } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

export default function FuelForm() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    vehicleApi.list({ page: 1, pageSize: 200 }).then((r) => setVehicles(r.items));
  }, []);

  const fields: FieldDef<FuelTransaction>[] = [
    {
      name: 'vehicle_id', label: 'Vehicle', type: 'select', required: true,
      options: vehicles.map((v) => ({ value: v.vehicle_id, label: v.registration_no })),
    },
    {
      name: 'fuel_type', label: 'Fuel Type', type: 'select', required: true,
      options: ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'].map((v) => ({ value: v, label: v })),
    },
    { name: 'txn_datetime', label: 'Transaction Date/Time', type: 'datetime-local', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit_of_measure', label: 'Unit of Measure', required: true, placeholder: 'L / Kg / kWh' },
    { name: 'rate_per_unit', label: 'Rate per Unit', type: 'number', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'odometer_km', label: 'Odometer (km)', type: 'number' },
    { name: 'start_soc_pct', label: 'Start SoC % (EV)', type: 'number' },
    { name: 'end_soc_pct', label: 'End SoC % (EV)', type: 'number' },
    { name: 'fill_pressure', label: 'Fill Pressure (CNG/LNG)', type: 'number' },
    { name: 'fuel_temperature', label: 'Fuel Temperature (LNG)', type: 'number' },
    { name: 'receipt_no', label: 'Receipt No' },
  ];

  return (
    <CrudFormPage<FuelTransaction>
      title="Fuel Transaction"
      basePath="/fuel"
      fields={fields}
      get={fuelTransactionApi.get}
      create={fuelTransactionApi.create}
      update={fuelTransactionApi.update}
      defaults={{ status: 'Recorded', fuel_type: 'Diesel', txn_datetime: new Date().toISOString().slice(0, 16) }}
    />
  );
}
