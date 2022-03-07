import mongoose from 'mongoose'
import { geometry, Point } from '@turf/helpers'
import { ClimbType } from '../ClimbTypes.js'
import { v4 as uuidv4 } from 'uuid'

const transformClimbRecord = (row: any): ClimbType => {
  /* eslint-disable-next-line */
  const { route_name, grade, safety, type, fa, metadata, description, protection, location } = row
  /* eslint-disable-next-line */
  const { parent_lnglat, left_right_seq, mp_route_id, mp_sector_id } = metadata
  return {
    _id: new mongoose.Types.ObjectId(),
    name: route_name,
    yds: grade.YDS,
    safety: safety,
    type: type,
    fa: fa,
    metadata: {
      climb_id: uuidv4(),
      lnglat: geometry('Point', parent_lnglat) as Point,
      left_right_index: left_right_seq,
      mp_id: mp_route_id,
      mp_crag_id: mp_sector_id
    },
    content: {
      description: Array.isArray(description) ? description.join('\n\n') : '',
      location: Array.isArray(location) ? location.join('\n\n') : '',
      protection: Array.isArray(protection) ? protection.join('\n\n') : ''
    }
  }
}

export default transformClimbRecord
