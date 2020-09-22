#include "extcode.h"
#ifdef __cplusplus
extern "C" {
#endif

/*!
 * FTIR_AutoAlign
 */
uint32_t __cdecl FTIR_AutoAlign(uint64_t Handle);
/*!
 * FTIR_AutoWavelengthCalib
 */
int32_t __cdecl FTIR_AutoWavelengthCalib(int32_t delayTime, 
	double calibLaserWavelength, double voltageWaveform[], char COMPort[], 
	int32_t len);
/*!
 * FTIR_DataProcess
 */
int32_t __cdecl FTIR_DataProcess(int32_t interferogramData[], 
	int32_t Error_in, double voltageWaveform[], double calibrationRelation[], 
	float minWavelength, uint16_t measurementMode, float maxWavelength, 
	double spectrum[], int32_t len, int32_t len2, int32_t len3, int32_t len4);
/*!
 * FTIR_DeviceConnect_VISA
 */
int32_t __cdecl FTIR_DeviceConnect_VISA(char COMPort[], 
	char connectionStatus[], int32_t len);
/*!
 * FTIR_GetSerialNum_VISA
 */
int32_t __cdecl FTIR_GetSerialNum_VISA(char COMPort[], char serialNumber[], 
	int32_t *deviceNumber, int32_t len);
/*!
 * FTIR_GetSpectrum
 */
int32_t __stdcall FTIR_GetSpectrum(char COMPort[], int32_t delayTime, 
	int32_t interferogramData[], int32_t len);
/*!
 * FTIR_ManualSaveCalib
 */
int32_t __cdecl FTIR_ManualSaveCalib(char COMPort[], char calibWaveform[], 
	LVBoolean *calibWritingError, LVBoolean *calibFileSizeError);
/*!
 * FTIR_ManualSaveWaveform
 */
int32_t __cdecl FTIR_ManualSaveWaveform(double maxVoltage, 
	char voltageWaveform[], char COMPort[], LVBoolean *waveformWritingError);
/*!
 * FTIR_ReadCalib
 */
int32_t __cdecl FTIR_ReadCalib(char COMPort[], double voltageWaveform[], 
	double calibrationRelation[], int32_t len, int32_t len2);

long __cdecl LVDLLStatus(char *errStr, int errStrLen, void *module);

#ifdef __cplusplus
} // extern "C"
#endif

