package com.beejsebazar

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SpeechModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var speechRecognizer: SpeechRecognizer? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String {
        return "SpeechModule"
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun start() {
        mainHandler.post {
            if (speechRecognizer == null) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        sendEvent("onSpeechStart", null)
                    }

                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}

                    override fun onEndOfSpeech() {
                        sendEvent("onSpeechEnd", null)
                    }

                    override fun onError(error: Int) {
                        val params = Arguments.createMap()
                        params.putInt("error", error)
                        sendEvent("onSpeechError", params)
                    }

                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (matches != null && matches.isNotEmpty()) {
                            val params = Arguments.createMap()
                            val array = Arguments.createArray()
                            for (match in matches) {
                                array.pushString(match)
                            }
                            params.putArray("value", array)
                            params.putString("text", matches[0])
                            sendEvent("onSpeechResults", params)
                        } else {
                            sendEvent("onSpeechEnd", null)
                        }
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (matches != null && matches.isNotEmpty()) {
                            val params = Arguments.createMap()
                            val array = Arguments.createArray()
                            for (match in matches) {
                                array.pushString(match)
                            }
                            params.putArray("value", array)
                            params.putString("text", matches[0])
                            sendEvent("onSpeechPartialResults", params)
                        }
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }

            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                // Use the locale defined in JS if possible, hardcoding to en-IN as earlier request
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN") 
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            }

            try {
                speechRecognizer?.startListening(intent)
            } catch (e: Exception) {
                val params = Arguments.createMap()
                params.putString("error", e.message)
                sendEvent("onSpeechError", params)
            }
        }
    }

    @ReactMethod
    fun stop() {
        mainHandler.post {
            speechRecognizer?.stopListening()
        }
    }

    @ReactMethod
    fun destroy() {
        mainHandler.post {
            speechRecognizer?.destroy()
            speechRecognizer = null
        }
    }
}
